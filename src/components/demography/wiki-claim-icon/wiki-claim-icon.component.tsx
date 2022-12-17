import useWikiClaimIcons from "../../../fiber-apps/demography-game/hooks/useWikiClaimIcons";

import { WikiClaimIconContainer } from "./wiki-claim-icon.styles";

type WikiClaimIconProps = {
  property: any; // onClicked: (p: any) => void;
};

const WikiClaimIcon = (props: WikiClaimIconProps) => {
  const { property } = props;
  //
  const { toClaimIcon } = useWikiClaimIcons();
  //
  const { value, isImage } = toClaimIcon(property);
  const image = isImage ? value : undefined;
  const icon = !isImage ? value : undefined;
  //
  return image || icon ? (
    <WikiClaimIconContainer>
      {image ? <img src={image} alt={property.name} /> : icon}
    </WikiClaimIconContainer>
  ) : null;
};

export default WikiClaimIcon;
