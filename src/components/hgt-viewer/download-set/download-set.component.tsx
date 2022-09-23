import { useMemo, useState } from "react";
import panoramas from "./panoramas.json";

const SERVICE_ROOT = "http://viewfinderpanoramas.org/dem3/";

const DownloadSet = () => {
  const keyToUrl = (key: string) => `${SERVICE_ROOT}${key}.zip`;
  //
  const [selectedKey, setSelectedKey] = useState<string>(
    Object.keys(panoramas)[0]
  );

  return (
    <div>
      Download one
      <hr />
      {selectedKey} <small>- Click on the map to download set</small>
      <div>
        <map name={"areas"}>
          {Object.entries(panoramas).map(([key, coords]) => (
            <area
              key={key}
              alt={key}
              title={key}
              shape={"rect"}
              coords={coords}
              href={keyToUrl(key)}
              onMouseEnter={(e) => {
                console.log(e.target);
                const area = e.target as HTMLAreaElement;
                setSelectedKey(area.alt);
              }}
            />
          ))}
        </map>
        <img
          alt=""
          src="data/earth/diffuse.jpg"
          useMap={"#areas"}
          style={{ width: "1800px", height: "900px", zoom: 0.25 }}
        />
      </div>
      <div>
        <small>
          Datasource:{" "}
          <a
            title="viewfinderpanoramas.org"
            href={"http://viewfinderpanoramas.org"}
            style={{ color: "gold" }}
          >
            viewfinderpanoramas.org
          </a>
        </small>
      </div>
    </div>
  );
};

export default DownloadSet;
