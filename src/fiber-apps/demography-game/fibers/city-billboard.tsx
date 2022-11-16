import { Billboard, Text } from "@react-three/drei";

import { formatPopulation } from "../../../utils/wiki";

import CircularProgress from "./circular-progress";

type CityBillboardProps = {
  data: any;
  //
  isTaken: boolean;
  showProgress: boolean;
  progressOffset: number;
};

const CityBillboard = (props: CityBillboardProps) => {
  const { data, isTaken, showProgress, progressOffset } = props;
  //
  const fontFamily = `${process.env.PUBLIC_URL}/../data/Roboto_Slab.ttf`;
  //
  return (
    <Billboard position={[0, 0.085, 0]} follow={true}>
      {showProgress && !isTaken && (
        <CircularProgress progressOffset={progressOffset} />
      )}

      {showProgress ? (
        <Text
          position={[0, 0.055, 0]}
          fontSize={0.0425}
          letterSpacing={0.015}
          color={"#ff9922"}
          font={fontFamily}
        >
          {formatPopulation(data.pop, true)}
        </Text>
      ) : null}

      <Text
        fontSize={0.0725}
        letterSpacing={0.015}
        color={"#ffff22"}
        font={fontFamily}
      >
        {data.name}
      </Text>
    </Billboard>
  );
};

export default CityBillboard;
