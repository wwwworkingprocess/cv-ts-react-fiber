/* This component wraps a PerspectiveCamera, OrthographicCamera, and CameraControls and allows smoothly transitioning
 * back and forth between the two cameras.
 * Note: it is designed to completely replace the default R3F camera system and should not be used alongside other cameras
 *
 * The component forwards an instance of CameraControls as the ref and all methods and props described here https://github.com/yomotsu/camera-controls
 * are available.
 *
 * View mode transition works by lerping between the orthographic and perspective projections matrices,
 * while camera-controls handles the position/target transitions.
 *  Popmotion is used for lerping the matrices  - it should be possible to swap in any animation library (e.g. Tween.js)
 *  as long as it can animate between two arrays of numbers
 *
 * State is saved for each view type - so switching back to a perspective/ortho will return the camera
 *   to the same position it was previously in for that view
 * Limitations and issues:
 *  - The "zoom" mode needs to be zoom for orthographic and dolly for perspective
 *    (see camera-controls docs for the difference and note that this is already the default, so just don't change it!)
 *  - Resizing the canvas during a transition might make projection matrices go out of sync (not tested)
 *  - changing the orthographicCameraProps.zoom after initialisation will cause problems
 */

import { ReactThreeFiber, useThree } from "@react-three/fiber";
import CameraControlsImpl from "camera-controls";
import { animate } from "popmotion";
import { PlaybackControls } from "popmotion/lib/animations/types";
import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  Box3,
  Clock,
  MathUtils,
  Matrix4,
  MOUSE,
  OrthographicCamera,
  PerspectiveCamera,
  Quaternion,
  Raycaster,
  Sphere,
  Spherical,
  Vector2,
  Vector3,
  Vector3Tuple,
  Vector4,
} from "three";

const subsetOfTHREE = {
  MOUSE: MOUSE,
  Vector2: Vector2,
  Vector3: Vector3,
  Vector4: Vector4,
  Quaternion: Quaternion,
  Matrix4: Matrix4,
  Spherical: Spherical,
  Box3: Box3,
  Sphere: Sphere,
  Raycaster: Raycaster,
  MathUtils: {
    DEG2RAD: MathUtils.DEG2RAD,
    clamp: MathUtils.clamp,
  },
};

CameraControlsImpl.install({ THREE: subsetOfTHREE });

const clock = new Clock();

// Temp vectors
const va = new Vector3();
const vb = new Vector3();

// These are sed to store the old camera state between views
// e.g.in orthographic mode, the previous perspective position/target is stored
// so that we can transition back to it
// Note: changing the equivalent position/target props after initialization will overwrite these
let persPos: Vector3Tuple;
let persTarget: Vector3Tuple;
let orthoPos: Vector3Tuple;
let orthoTarget: Vector3Tuple;
// let orthoZoom: number; // <---- orig
let orthoZoom:
  | number
  | {
      zoom?: number | undefined;
      near?: number | undefined;
      far?: number | undefined;
    };
let oldMat: string;

export type ControlledCamerasProps = ReactThreeFiber.Overwrite<
  ReactThreeFiber.Object3DNode<CameraControlsImpl, typeof CameraControlsImpl>,
  {
    mode: "perspective" | "orthographic"; // change this to initiate a transition between view modes

    // Changing the position/target props will animate the camera to a new position
    perspectivePosition?: Vector3Tuple;
    perspectiveTarget?: Vector3Tuple;
    orthographicPosition?: Vector3Tuple;
    orthographicTarget?: Vector3Tuple;

    // Camera settings
    perspectiveCameraProps?: {
      fov?: number;
      near?: number;
      far?: number;
    };
    orthographicCameraProps?: {
      // TODO: changing the ortho zoom causes issues as the saved orthoZoom gets out of sync
      zoom?: number;
      near?: number;
      far?: number;
    };
    onControlStart?: (e: any) => void;
    onControl?: (e: any) => void;
    onControlEnd?: (e: any) => void;
    onTransitionStart?: (e: any) => void;
    onUpdate?: (e: any) => void;
    onWake?: (e: any) => void;
    onRest?: (e: any) => void;
    onSleep?: (e: any) => void;
    mouseButtons: Partial<CameraControlsImpl["mouseButtons"]>;
    touches: Partial<CameraControlsImpl["touches"]>;
  }
>;

export const ControlledCameras = forwardRef<
  CameraControlsImpl,
  ControlledCamerasProps
>(
  (
    {
      mode,
      perspectivePosition = [0, 0, 0],
      perspectiveTarget = [0, 0, 0],
      orthographicPosition = [0, 0, 0],
      orthographicTarget = [0, 0, 0],
      perspectiveCameraProps = {
        fov: 50,
        near: 0.1,
        far: 1000,
      },
      orthographicCameraProps = {
        zoom: 100,
        near: 0,
        far: 1000,
      },
      onControlStart,
      onControl,
      onControlEnd,
      onTransitionStart,
      onUpdate,
      onWake,
      onRest,
      onSleep,
      ...restProps
    },
    ref
  ) => {
    console.log("CONTROLS");
    const set = useThree((state) => state.set);
    const gl = useThree((state) => state.gl);
    const invalidate = useThree((state) => state.invalidate);
    const size = useThree((state) => state.size);

    const animation = useRef<PlaybackControls>();

    const [persCam, orthoCam] = useMemo(() => {
      const persCam = new PerspectiveCamera();
      const orthoCam = new OrthographicCamera();
      (orthoCam as any).zoom = orthographicCameraProps.zoom;
      orthoZoom = orthographicCameraProps.zoom as any;

      set(() => ({ camera: mode === "perspective" ? persCam : orthoCam }));
      return [persCam, orthoCam];
    }, [set]); // eslint-disable-line react-hooks/exhaustive-deps

    const controls = useMemo(() => {
      const controls = new CameraControlsImpl(
        mode === "perspective" ? persCam : orthoCam,
        gl.domElement
      );
      if (mode === "perspective") {
        controls.setLookAt(...perspectivePosition, ...perspectiveTarget, false);
      } else {
        controls.setLookAt(
          ...orthographicPosition,
          ...orthographicTarget,
          false
        );
      }
      if (!persPos) persPos = perspectivePosition.slice() as Vector3Tuple;
      if (!persTarget) persTarget = perspectiveTarget.slice() as Vector3Tuple;
      if (!orthoPos) orthoPos = orthographicPosition.slice() as Vector3Tuple;
      if (!orthoTarget)
        orthoTarget = orthographicTarget.slice() as Vector3Tuple;

      return controls;
    }, [clock, invalidate, orthoCam, persCam, gl]); // eslint-disable-line react-hooks/exhaustive-deps

    /*  Keep cameras in sync with viewport state */
    useLayoutEffect(() => {
      orthoCam.left = size.width / -2;
      orthoCam.right = size.width / 2;
      orthoCam.top = size.height / 2;
      orthoCam.bottom = size.height / -2;
      (orthoCam as any).near = orthographicCameraProps.near;
      (orthoCam as any).far = orthographicCameraProps.far;
      orthoCam.updateProjectionMatrix();

      persCam.aspect = size.width / size.height;
      persCam.updateProjectionMatrix();
    }, [size, persCam, orthoCam]); // eslint-disable-line react-hooks/exhaustive-deps

    /* Keep the cameras in sync with prop changes */
    useLayoutEffect(() => {
      if (controls.enabled) persCam.updateProjectionMatrix();
    }, [controls, persCam, perspectiveCameraProps]);

    useLayoutEffect(() => {
      if (orthoZoom !== orthographicCameraProps.zoom) {
        orthoZoom = orthographicCameraProps.zoom as any;
      }
      if (controls.enabled) {
        orthoCam.updateProjectionMatrix();

        // TODO: this causes problems
        // if (mode === "orthographic") {
        //   controls.zoomTo(orthographicCameraProps.zoom, true);
        // }
      }
    }, [controls, orthoCam, orthographicCameraProps]); // eslint-disable-line react-hooks/exhaustive-deps

    /*  Generating frames on-demand using camera-controls is a bit tricker than
     * with OrbitControls as the "update" event only fires when controls.update() is called
     * and actually does an update. So we need to set up a separate loop, call controls.update
     * there and invalidate if the update method returns true
     * TODO: is there a simpler way of doing this?
     */
    useEffect(() => {
      let requestId: number;

      (function loop() {
        requestId = requestAnimationFrame(loop);

        const delta = clock.getDelta();
        const controlsDidUpdate = controls.update(delta);
        if (controlsDidUpdate) {
          invalidate();
        }
      })();

      return () => cancelAnimationFrame(requestId);
    }, [controls, invalidate]);

    /* Transition to new position/target when props change
     * Changing the these props will cause the camera to animate to the new state
     * Note: these are split into separate use effects to avoid overwriting the other stored positions/targets
     */
    useEffect(() => {
      if (mode === "perspective") {
        controls.setPosition(...perspectivePosition, true);
      }
      persPos = perspectivePosition.slice() as Vector3Tuple;
    }, [controls, JSON.stringify(perspectivePosition)]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      if (mode === "perspective") {
        controls.setTarget(...perspectiveTarget, true);
      }
      persTarget = perspectiveTarget.slice() as Vector3Tuple;
    }, [controls, JSON.stringify(perspectiveTarget)]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      if (mode === "orthographic") {
        controls.setPosition(...orthographicPosition, true);
      }
      orthoPos = orthographicPosition.slice() as Vector3Tuple;
    }, [controls, JSON.stringify(orthographicPosition)]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
      if (mode === "orthographic") {
        controls.setTarget(...orthographicTarget, true);
      }
      orthoTarget = orthographicTarget.slice() as Vector3Tuple;
    }, [controls, JSON.stringify(orthographicTarget)]); // eslint-disable-line react-hooks/exhaustive-deps

    /* Transition between perspective and orthographic when mode prop changes */
    useEffect(() => {
      (async () => {
        controls.enabled = false; // Disable input during transition
        const currentMode = (controls.camera as PerspectiveCamera)
          .isPerspectiveCamera
          ? "perspective"
          : "orthographic";

        const newCam = mode === "perspective" ? persCam : orthoCam;
        const currentMat = controls.camera.projectionMatrix.elements.toString();
        let newMat;

        // In this case a transition was interrupted and we will reverse back to the same mode
        // No camera change required
        let cameraChangeRequired = false;
        if (currentMode === mode) {
          if (!oldMat) {
            oldMat = controls.camera.projectionMatrix.elements.toString();
          }
          newMat = oldMat;
        }
        // However if the new  mode doesn't match the current camera, we will initiate a transition
        else {
          cameraChangeRequired = true;

          // Store the current projection matrix so that we can switch back to this view
          oldMat = controls.camera.projectionMatrix.elements.toString();
          newMat = newCam.projectionMatrix.elements.toString();

          // Save the current position and target for either ortho or perspective
          controls.getPosition(va);
          controls.getTarget(vb);
          if (mode === "perspective") {
            va.toArray(orthoPos);
            vb.toArray(orthoTarget);
            orthoZoom = orthoCam.zoom;
          } else {
            va.toArray(persPos);
            vb.toArray(persTarget);
          }
        }

        animation.current?.stop();
        animation.current = animate({
          from: {
            // using a string because popmotion can't animate arrays!
            matrix: currentMat,
          },
          to: {
            matrix: newMat,
          },
          duration: 1000,
          onUpdate: (latest) => {
            controls.camera.projectionMatrix.fromArray(
              latest.matrix.split(",").map(Number)
            );

            invalidate();
          },
          onComplete: () => {
            if (cameraChangeRequired) {
              // At this point, the old camera will have a switched projection matrix -
              // the orthographic camera will have a perspective projection matrix
              // and the perspective camera will have an ortho matrix, so we
              // need to reset the projection matrix for the old camera
              controls.camera.updateProjectionMatrix();

              // And then switch the controls and R3F over to the new camera
              set({ camera: newCam });
              controls.camera = newCam;

              // Finally, restore the zoom for the ortho camera
              // (and remember that we use Dolly, not Zoom for perspective)
              controls.zoomTo(
                mode === "perspective" ? 1 : (orthoZoom as any),
                false
              );
              controls.enabled = true;
            }
            invalidate();
          },
        });

        // Transition the position and target
        if (mode === "perspective") {
          await controls.setLookAt(...persPos, ...persTarget, true);
        } else if (mode === "orthographic") {
          await controls.setLookAt(...orthoPos, ...orthoTarget, true);
        }

        // TODO: if not changing the camera it could take quite a while to reach here - is there a way to
        // re-enable faster without waiting for "rest"?
        controls.enabled = true;
      })();
    }, [invalidate, mode, controls, orthoCam, persCam, set]);

    /* Set up event listeners */
    useEffect(() => {
      if (onControlStart)
        controls.addEventListener("controlstart", onControlStart);
      if (onControl) controls.addEventListener("control", onControl);
      if (onControlEnd) controls.addEventListener("controlend", onControlEnd);
      if (onTransitionStart)
        controls.addEventListener("transitionstart", onTransitionStart);
      if (onUpdate) controls.addEventListener("update", onUpdate);
      if (onWake) controls.addEventListener("wake", onWake);
      if (onRest) controls.addEventListener("rest", onRest);
      if (onSleep) controls.addEventListener("sleep", onSleep);

      return () => {
        if (onControlStart)
          controls.removeEventListener("controlstart", onControlStart);
        if (onControl) controls.removeEventListener("control", onControl);
        if (onControlEnd)
          controls.removeEventListener("controlend", onControlEnd);
        if (onTransitionStart)
          controls.removeEventListener("transitionstart", onTransitionStart);
        if (onUpdate) controls.removeEventListener("update", onUpdate);
        if (onWake) controls.removeEventListener("wake", onWake);
        if (onRest) controls.removeEventListener("rest", onRest);
        if (onSleep) controls.removeEventListener("sleep", onSleep);
      };
    }, [
      controls,
      onControlStart,
      onControl,
      onControlEnd,
      onTransitionStart,
      onUpdate,
      onWake,
      onRest,
      onSleep,
    ]);

    return (
      <>
        <primitive ref={ref} object={controls} {...restProps} />
        <primitive object={persCam} {...perspectiveCameraProps} />
        <primitive
          object={orthoCam}
          // zoom={orthographicCameraProps.zoom}
          near={orthographicCameraProps.near}
          far={orthographicCameraProps.far}
        />
      </>
    );
  }
);
