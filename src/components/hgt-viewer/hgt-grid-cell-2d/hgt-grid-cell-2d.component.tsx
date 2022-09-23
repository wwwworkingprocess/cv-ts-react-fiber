import { FC } from "react";
import {
  HgtGridCellBackground,
  HgtGridCellForeground,
} from "./hgt-grid-cell-2d.styles";

const HgtGridCell2D: FC<{
  locator: string;
  zipIndex: number;
  children: any;
}> = (props: { locator: string; zipIndex: number; children: any }) => {
  const { locator, zipIndex, children } = props;
  //
  return (
    <>
      <HgtGridCellBackground width={150}>{children}</HgtGridCellBackground>
      <HgtGridCellForeground width={150} height={150}>
        <h5>{locator}</h5>
        <div>{zipIndex !== -1 ? zipIndex : " "}</div>
      </HgtGridCellForeground>
    </>
  );
};

export default HgtGridCell2D;
