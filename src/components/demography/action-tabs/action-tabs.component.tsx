import {
  ActionTab,
  ActionTabsContainer,
  ActionTabSelected,
} from "./action-tabs.styles";

type ActionTabsProps = {
  tabs: Array<any>;
  tabsIndex: number;
  selectedCode: string | undefined;
  //
  setTabsIndex: React.Dispatch<number>;
};

//
//
//
const ActionTabs = (props: ActionTabsProps) => {
  const { tabs, tabsIndex, setTabsIndex, selectedCode } = props;
  //
  const visibleTabs = tabs.filter(
    (t, idx) => idx !== 3 || (selectedCode && idx === 3)
  );
  //
  return (
    <ActionTabsContainer>
      {visibleTabs.map((t, idx) =>
        idx === tabsIndex ? (
          <ActionTabSelected key={idx}>
            <b>{t}</b>
          </ActionTabSelected>
        ) : (
          <ActionTab key={idx} onClick={() => setTabsIndex(idx)}>
            {t}
          </ActionTab>
        )
      )}
    </ActionTabsContainer>
  );
};

export default ActionTabs;
