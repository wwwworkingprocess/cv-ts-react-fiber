import React, { useMemo, useRef } from "react";

import { useThree } from "@react-three/fiber";
import { useGesture } from "@use-gesture/react";
import * as THREE from "three";
import { Group, Vector3 } from "three";

export function Draggable(
  props: JSX.IntrinsicElements["group"] & {
    onDragStart: any;
    onDragEnd: any;
  }
  // { children, onDragStart, onDragEnd, ...props }: any
) {
  const { onDragStart, onDragEnd, children } = props;
  //
  const ref = useRef<Group>();
  //
  const { raycaster, size, camera } = useThree();
  const { mouse2D, mouse3D, offset, normal, plane } = useMemo(() => {
    return {
      mouse2D: new THREE.Vector2(), // Normalized 2D screen space mouse coords
      mouse3D: new THREE.Vector3(), // 3D world space mouse coords
      offset: new THREE.Vector3(), // Drag point offset from object origin
      normal: new THREE.Vector3(), // Normal of the drag plane
      plane: new THREE.Plane(), // Drag plane
    };
  }, []);

  //
  //
  //
  const bind = useGesture({
    onDrag: ({ xy: [x, y] }) => {
      // Compute normalized mouse coordinates (screen space)
      const nx = (x / size.width) * 2 - 1;
      const ny = (-y / size.height) * 2 + 1;
      // Unlike the mouse from useThree, this works offscreen
      mouse2D.set(nx, ny);

      // Update raycaster (otherwise it doesn't track offscreen)
      raycaster.setFromCamera(mouse2D, camera);

      // The drag plane is normal to the camera view
      camera.getWorldDirection(normal).negate();

      // Find the plane that's normal to the camera and contains our drag point
      // plane.setFromNormalAndCoplanarPoint(normal, mouse3D);
      plane.setFromNormalAndCoplanarPoint(
        normal,
        new Vector3(mouse3D.x, 0, mouse3D.z)
      );

      // Find the point of intersection
      raycaster.ray.intersectPlane(plane, mouse3D);

      // Update the object position with the original offset
      if (ref.current && ref.current.position)
        ref.current.position.copy(mouse3D).add(offset);
    },

    //
    onDragStart: ({ event }) => {
      const { eventObject, point } = event as any;

      // Save the offset of click point from object origin
      eventObject.getWorldPosition(offset).sub(point);

      // Set initial 3D cursor position (needed for onDrag plane calculation)
      mouse3D.copy(point);

      // Run user callback
      onDragStart(event);
    },

    //
    onDragEnd: ({ event }) => onDragEnd(event),
  });

  return (
    <group ref={ref} {...(bind() as any)}>
      {children}
    </group>
  );
}
