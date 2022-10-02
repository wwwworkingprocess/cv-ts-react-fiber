import { SetStateAction, useEffect, useState } from "react";

import AppHome3D from "../../fiber-apps/app-3d/app-home-3d";

import Dialog from "../../components/dialog/dialog.component";
import {
  selectCountries,
  selectIsLoading,
} from "../../store/countries/countries.selector";
import { useDispatch, useSelector } from "react-redux";
import { fetchCountriesStart } from "../../store/countries/countries.action";
import { isMobile } from "react-device-detect";
import { NavLink } from "react-router-dom";

type TimerProps = {
  isActive: boolean;
  seconds: number;
  setSeconds: React.Dispatch<SetStateAction<number>>;
};

export const formatSeconds = (sec: number) => {
  const pad = (n: number) => (n < 10 ? `0${n}` : n);
  //
  const h = Math.floor(sec / 3600);
  const m = Math.floor(sec / 60 - h * 60);
  const s = Math.floor(sec - h * 3600 - m * 60);
  //
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

export const Timer = ({ isActive, seconds, setSeconds }: TimerProps) => {
  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
      //
      return () => clearInterval(interval);
    }
  }, [isActive, setSeconds]);
  //
  return <>{seconds}</>;
};

const DataLoadTest = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Array<any> | null>(null);
  //
  useEffect(() => {
    const fetchApi = () => {
      fetch("data/course/3792262.json", { mode: "no-cors" })
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          setLoading(false);
          setData(json);
        });
    };
    //
    fetchApi();
  }, []);
  //
  return loading ? (
    <h1>Loading</h1>
  ) : (
    <div>
      <h1>Data fetched successfully.</h1>
      {data && data.length} items
    </div>
  );
};

const Home = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [isShadowEnabled, setIsShadowEnabled] = useState<boolean>(!isMobile);
  //
  const countries = useSelector(selectCountries);
  // const isLoading = useSelector(selectIsLoading);
  //
  const dispatch = useDispatch();
  //
  useEffect(() => {
    dispatch(fetchCountriesStart());
  }, [dispatch]);
  //
  return (
    <>
      <h2>Good to see You here!</h2>
      <p>
        This site is a collection of micro applications, created during
        September 2022, written in TypeScript using React and 3D.
      </p>
      <p>
        Please have a look around, check my{" "}
        <NavLink to="viewer">Topographic Map Viewer </NavLink>
        or the <NavLink to="demos">Demos Page</NavLink> for some simpler
        applications of 'Reactive 3D' in action.
      </p>
      <div style={{ textAlign: "right" }}>
        <button onClick={(e) => setShowGrid((b) => !b)}>
          Grid: {showGrid ? "ON" : "OFF"}
        </button>
        <button onClick={(e) => setIsShadowEnabled((b) => !b)}>
          Shadows: {isShadowEnabled ? "ON" : "OFF"}
        </button>
      </div>
      {
        <AppHome3D
          isShadowEnabled={isShadowEnabled}
          showGrid={showGrid}
          countries={countries}
          setIsOpen={setIsOpen}
        />
      }
      <Dialog isOpen={isOpen} onClose={(e: CloseEvent) => setIsOpen(false)}>
        <DataLoadTest />
      </Dialog>
      <div style={{ textAlign: "center", padding: "10px" }}>
        This project is open source, please feel free to visit &amp; fork the{" "}
        <a
          href="https://github.com/wwwworkingprocess/cv-ts-react-fiber"
          title="Github"
          target="_blank"
          rel="noreferrer"
        >
          repo on Github.
        </a>
        or find{" "}
        <a
          href="https://www.linkedin.com/in/gergely-marton-a75402a1"
          title="LinkedIn"
          target="_blank"
          rel="noreferrer"
        >
          me on LinkedIn.
        </a>
      </div>
    </>
  );
};

export default Home;
