import { SetStateAction, useEffect, useState } from "react";

import App3D from "../../App3D";

import Dialog from "../../components/dialog/dialog.component";

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

const DataLoadTest = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Array<any> | null>(null);

  const fetchApi = () => {
    fetch("data/course/3792262.json", { mode: "no-cors" })
      //fetch("https://jsonplaceholder.typicode.com/users")
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        console.log(json);
        setLoading(false);
        setData(json);
      });
  };

  useEffect(() => {
    fetchApi();
  }, []);

  if (loading) return <h1>Loading</h1>;

  return (
    <div>
      <h1>Data fetched successfully.</h1>
      {data && data.length} items
    </div>
  );
};

const Home = () => {
  const [isOpen, setIsOpen] = useState(false);
  //
  /*
  const [count, setCount] = useState<number>(0);
  //
  // const MINUTE_MS = 60000;
  //
  const cb = async () => {
    const MAX_API_TRIES = 1;
    const nextCount = Math.min((count || 0) + 1, MAX_API_TRIES);
    //
    console.log("running callback", count, "next", nextCount);
    //
    if (nextCount === MAX_API_TRIES) {
      console.log("remove effect after last try (max)", "SKIP");
    } else {
      setCount(nextCount);
    }
  };
  */

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
      <Timer isActive={isActive} seconds={seconds} setSeconds={setSeconds} />
      <App3D setIsOpen={setIsOpen} />
      <Dialog isOpen={isOpen} onClose={(e: CloseEvent) => setIsOpen(false)}>
        <DataLoadTest />
      </Dialog>
      <button onClick={(e) => setIsOpen(true)}>Open Dialog</button>
    </>
  );
};

export default Home;
