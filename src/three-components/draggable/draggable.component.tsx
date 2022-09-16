import { useMemo, useRef } from "react";

import { useThree } from "@react-three/fiber";
import { BoundsApi, useBounds } from "@react-three/drei";
import { useGesture } from "@use-gesture/react";

import { Group, Plane, Vector2, Vector3 } from "three";

export function Draggable(
  props: JSX.IntrinsicElements["group"] & {
    onDragStart: any;
    onDragEnd: any;
  }
) {
  const { onDragStart, onDragEnd, children } = props;
  //
  const ref = useRef<Group>();
  //
  const { raycaster, size, camera } = useThree();
  const { mouse2D, mouse3D, offset, normal, plane } = useMemo(() => {
    return {
      mouse2D: new Vector2(), // Normalized 2D screen space mouse coords
      mouse3D: new Vector3(), // 3D world space mouse coords
      offset: new Vector3(), // Drag point offset from object origin
      normal: new Vector3(), // Normal of the drag plane
      plane: new Plane(), // Drag plane
    };
  }, []);

  //
  // Handling onDrag, onDragStart, onDragEnd events
  //
  const bind = useGesture({
    onDrag: ({ xy: [x, y] }) => {
      //
      // Compute normalized mouse coordinates (screen space)
      //
      const nx = (x / size.width) * 2 - 1;
      const ny = (-y / size.height) * 2 + 1;
      //
      mouse2D.set(nx, ny); // Unlike the mouse from useThree, this works offscreen
      raycaster.setFromCamera(mouse2D, camera); // Update raycaster (otherwise it doesn't track offscreen)
      camera.getWorldDirection(normal).negate(); // The drag plane is normal to the camera view
      //
      // Find the plane that's normal to the camera and contains our drag point
      // plane.setFromNormalAndCoplanarPoint(normal, mouse3D);
      //
      plane.setFromNormalAndCoplanarPoint(
        normal,
        new Vector3(mouse3D.x, 0, mouse3D.z)
      );
      //
      raycaster.ray.intersectPlane(plane, mouse3D); // Find the point of intersection
      //
      // Update the object position with the original offset
      //
      if (ref.current && ref.current.position)
        ref.current.position.copy(mouse3D).add(offset);
    },

    //
    onDragStart: ({ event }) => {
      const { eventObject, point } = event as any;
      //
      // Save the offset of click point from object origin
      //
      eventObject.getWorldPosition(offset).sub(point);
      //
      mouse3D.copy(point); // Set initial 3D cursor position (needed for onDrag plane calculation)
      //
      onDragStart(event); // Run user callback
    },

    //
    onDragEnd: ({ event }) => {
      boundsApi.refresh().clip().fit(); // use bounds provider to zoom on draggable
      //
      onDragEnd(event); // Run user callback
    },
  });
  //
  const boundsApi: BoundsApi = useBounds(); // context provider by parent control
  //
  return (
    <group ref={ref} {...(bind() as any)}>
      {children}
    </group>
  );
}
