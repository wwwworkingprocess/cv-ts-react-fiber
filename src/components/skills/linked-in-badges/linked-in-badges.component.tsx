import linkedInSkills from "../../../routes/skills/linked-in.json";

import {
  LinkedInBadge,
  LinkedInBadgesContainer,
} from "./linked-in-badges.styles";

const LinkedInBadges = () => {
  return (
    <LinkedInBadgesContainer>
      {linkedInSkills
        .sort((a, b) => a.top - b.top)
        .map(({ url, name, top, people }, i) => (
          <LinkedInBadge key={i}>
            <b>{decodeURIComponent(name)}</b>
            <br />
            <span>in top {top}%</span>
          </LinkedInBadge>
        ))}
    </LinkedInBadgesContainer>
  );
};

export default LinkedInBadges;
