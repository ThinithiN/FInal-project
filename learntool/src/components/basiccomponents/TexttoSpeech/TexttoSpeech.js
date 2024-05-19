import React, { useState, useEffect } from "react";

import { MDBIcon } from "mdb-react-ui-kit";

import { useGlobalState } from "../../../global/global";

const TextToSpeech = ({ text }) => {
  const { state, dispatch } = useGlobalState();

  const [playingText, setPlayingText] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [utterance, setUtterance] = useState(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const u = new SpeechSynthesisUtterance(text);

    setUtterance(u);

    return () => {
      synth.cancel();
      u.onstart = null;
      u.onend = null;
    };
  }, [text]);

  const handlePlay = () => {
    handleStop();

    const synth = window.speechSynthesis;

    if (isPaused) {
      synth.resume();
    }

    utterance.onstart = () => {
      setIsPlaying(true);
      setPlayingText(text);

      dispatch({ type: "SET_VALUE", payload: text });
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setPlayingText(null);
    };

    synth.speak(utterance);

    setIsPaused(true);
  };

  const handlePause = () => {
    const synth = window.speechSynthesis;
    synth.pause();

    setIsPaused(true);
  };

  const handleStop = () => {
    const synth = window.speechSynthesis;

    synth.cancel();

    setIsPaused(false);
    setIsPlaying(false);
  };

  return (
    <div key={text}>
      &nbsp;
      <MDBIcon
      size='2x'
        fas
        icon={state.value === text && isPlaying ? "volume-up" : "volume-off"}
        onClick={handlePlay}
        style={{ cursor: "pointer" }}
      />
      &nbsp;&nbsp;
      {state.value === text && isPlaying && (
        <MDBIcon
        size='2x'
          fas
          icon="volume-mute"
          onClick={handleStop}
          style={{ cursor: "pointer" }}
        />
      )}
    </div>
  );
};
export default TextToSpeech;
