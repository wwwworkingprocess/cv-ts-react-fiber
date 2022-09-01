import { SetStateAction, useCallback, useEffect, useState } from "react";

import { DataLoadTest } from "../../App";

import App3D from "../../App3D";

import Dialog from "../../components/dialog/dialog.component";
import useCoinGeckoPrices from "../../hooks/useCoinGeckoPrices";

const MAX_API_TRIES = 1;

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
      console.log("created timer", interval);
      //
      return () => clearInterval(interval);
    }
  }, [isActive, setSeconds]);
  //
  return <>{seconds}</>;
};

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);
  //
  const [count, setCount] = useState<number>(0);
  //
  const { getEthereumPriceFromCoinGecko } = useCoinGeckoPrices();
  //
  // const MINUTE_MS = 60000;
  const FIVE_SECONDS_MS = 15000;

  const cb = async () => {
    //const cb = async () => {
    const nextCount = Math.min((count || 0) + 1, MAX_API_TRIES);
    //
    console.log("running callback", count, "next", nextCount);
    //

    //
    if (nextCount === MAX_API_TRIES) {
      console.log("remove effect after last try (max)", "SKIP");
    } else {
      try {
        const res = await getEthereumPriceFromCoinGecko();

        console.log("res", res);
      } catch (error) {
        console.log("ERROR", error);
      }

      //
      setCount(nextCount);
    }
  };

  //
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  //
  useEffect(() => {
    if (seconds > 10) {
      setIsActive(false);
    }
  }, [seconds]);

  //
  return (
    <>
      Personal Portfolio Page ({formatSeconds(seconds)})
      <Timer isActive={isActive} seconds={seconds} setSeconds={setSeconds} />
      <App3D setIsOpen={setIsOpen} />
      <Dialog isOpen={isOpen} onClose={(e: CloseEvent) => setIsOpen(false)}>
        {/* <App3D paused={!isPaused} heightmapScale={heightmapScale}/> */}
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Iste a ipsam
        repellendus commodi ad, fugit id magnam inventore laudantium autem.
        <DataLoadTest />
      </Dialog>
      <button onClick={(e) => setIsOpen(true)}>Open Dialog</button>
    </>
  );
};

export default Home;
