import { useMemo, useState } from "react";
import useWindowSize from "../../../hooks/useWindowSize";
import useWikiImages from "../../../hooks/wiki/useWikiImages";

import { distance } from "../../../utils/geo";
import TreeHelper from "../../../utils/tree-helper";
import { Spinner } from "../../spinner/spinner.component";

type NearbyTreeItemProps = {
  tree: TreeHelper | undefined;
  selectedCode: string | undefined;
  //
  setSelectedCode: (c: string | undefined) => void;
};

const NearbyTreeItems = (props: NearbyTreeItemProps) => {
  const { tree, selectedCode, setSelectedCode } = props;
  //
  const isReady = tree && selectedCode;
  const node = isReady ? tree._n(selectedCode) : undefined;
  //
  const [range, setRange] = useState<number>(3);
  //
  const top10 = useMemo(() => {
    const data = node ? node.data : {};
    const { lat, lng } = data;
    //
    const all = tree ? tree.list_all() : [];
    //
    const nodes = all
      .map((n) => ({
        ...n,
        distance: distance([lat, lng], [n.data?.lat ?? 0, n.data?.lng ?? 0]),
      }))
      .filter((n) => n.distance * 10e-4 < range)
      .sort((a, b) => a.distance - b.distance);
    //
    nodes.shift(); // removing 'selectedCode' as it is closest to itself
    //
    return nodes;
  }, [tree, node, range]);
  //
  // console.log("top10 changed", top10);
  const topTenCodes = useMemo(
    () => top10.map((node) => `Q${node.code}`),
    [top10]
  );
  //
  const { images, loading } = useWikiImages(topTenCodes, 50);
  //
  const defaultUrl =
    "https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/Charleroi - Hôtel de ville vu de la place Charles II - 2019-06-01.jpg&width=95";
  //
  const { screenSizeName } = useWindowSize();
  //
  const repeatColumns = useMemo(() => {
    switch (screenSizeName) {
      case "mini":
        return 2;
      case "small":
        return 3;
      case "normal":
        return 4;
      case "large":
        return 5;
      case "extra":
        return 7;
    }
    //
    return 1;
  }, [screenSizeName]);
  //
  return tree && selectedCode ? (
    <div>
      {tree._n(selectedCode)?.name}, range
      <input
        type="number"
        value={range}
        style={{ width: "50px", margin: "0px 5px 0px 5px" }}
        onChange={(e) => setRange(parseInt(e.target.value))}
      />{" "}
      km
      <br />
      {top10.length === 0 ? "No matches." : ""}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${repeatColumns}, 1fr)`,
        }}
      >
        {top10.map((n, idx) => (
          <div
            key={n.code}
            onClick={(e) => setSelectedCode(`Q${n.code}`)}
            style={{
              textAlign: "center",
              // border: "solid 1px orange",
              maxWidth: "100px",
              marginBottom: "4px",
            }}
          >
            <div
              style={{
                width: "100px",
                // border: "solid 1px red",
                textAlign: "center",
                margin: "auto",
              }}
            >
              <small>{(n.distance * 10e-4).toFixed(2)} km</small>
            </div>
            {images ? (
              <img
                src={images[`Q${n.code}`] ?? defaultUrl}
                alt={n.name}
                style={{
                  height: "71px",
                  maxWidth: "100px",
                  objectFit: "cover",
                  margin: "auto",
                }}
              />
            ) : (
              <div style={{ width: "40px", height: "30px" }}>
                <Spinner />
              </div>
            )}
            <div
              style={{
                width: "100px",
                // border: "solid 1px red",
                textAlign: "center",
                margin: "auto",
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {n.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  ) : null;
};

export default NearbyTreeItems;
