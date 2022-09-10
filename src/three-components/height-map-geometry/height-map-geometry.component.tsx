import { useRef, useEffect } from "react";
import { BufferGeometry, Float32BufferAttribute, PlaneGeometry } from "three";

const HeightmapGeometry: React.FC<{
  elementSize: number;
  heights: number[][];
}> = ({ elementSize, heights }) => {
  const ref = useRef<PlaneGeometry>(null);

  useEffect(() => {
    if (!ref.current) return;
    const dx = elementSize;
    const dy = elementSize;

    /* Create the vertex data from the heights. */
    const vertices = heights.flatMap((row, i) =>
      row.flatMap((z, j) => [i * dx, z, -j * dy])
    );

    /* Create the faces. */
    const indices = [];
    for (let i = 0; i < heights.length - 1; i++) {
      for (let j = 0; j < heights[i].length - 1; j++) {
        const stride = heights[i].length;
        const index = i * stride + j;
        indices.push(index + 1, index + stride, index + stride + 1);
        indices.push(index + stride, index + 1, index);
      }
    }

    ref.current.setIndex(indices);
    ref.current.setAttribute(
      "position",
      new Float32BufferAttribute(vertices, 3)
    );
    ref.current.computeVertexNormals();
    ref.current.computeBoundingBox();
    ref.current.computeBoundingSphere();
  }, [heights, elementSize]);

  return <planeBufferGeometry ref={ref} args={[1, 1, 120 - 1, 120 - 1]} />;
};

export default HeightmapGeometry;
