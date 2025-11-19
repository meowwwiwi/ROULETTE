import anime from "animejs";
import React from "react";
import { useEffect } from "react";
import { rouletteData, WheelNumber } from "./Global";


const Wheel = ( props : {rouletteData : rouletteData, number: WheelNumber}) : JSX.Element => {
  var totalNumbers = 37;
  var singleSpinDuration = 5000;
  var singleRotationDegree = 360 / totalNumbers;
  var lastNumber = 0;

  var rouletteWheelNumbers = props.rouletteData.numbers;
  console.log(props.rouletteData);
  console.log(props.number);
  const getRouletteIndexFromNumber = (number: string) => {
    return rouletteWheelNumbers.indexOf(parseInt(number));
  };
  const nextNumber = (number: any) => {
    var value = number;
    return value;
  };
  const getRotationFromNumber = (number: string) => {
    var index = getRouletteIndexFromNumber(number);
    return singleRotationDegree * index;
  };
  const getRandomEndRotation = (minNumberOfSpins: number, maxNumberOfSpins: number) => {
    var rotateTo = anime.random(
      minNumberOfSpins * totalNumbers,
      maxNumberOfSpins * totalNumbers
    );

    return singleRotationDegree * rotateTo;
  };
  const getZeroEndRotation = (totalRotaiton: number) => {
    var rotation = 360 - Math.abs(totalRotaiton % 360);

    return rotation;
  };
  const getBallEndRotation = (zeroEndRotation: number, currentNumber: any) => {
    return Math.abs(zeroEndRotation) + getRotationFromNumber(currentNumber);
  };
  const getBallNumberOfRotations = (minNumberOfSpins: number, maxNumberOfSpins: number) => {
    var numberOfSpins = anime.random(minNumberOfSpins, maxNumberOfSpins);
    return 360 * numberOfSpins;
  };

  function spinWheel(number: number) {
    const bezier = [0.165, 0.84, 0.44, 1.005];
    var ballMinNumberOfSpins = 2;
    var ballMaxNumberOfSpins = 4;
    var wheelMinNumberOfSpins = 2;
    var wheelMaxNumberOfSpins = 4;

    var currentNumber = nextNumber(number);

    var lastNumberRotation = getRotationFromNumber(lastNumber.toString()); 
    var endRotation = -getRandomEndRotation(
      ballMinNumberOfSpins,
      ballMaxNumberOfSpins
    );
    var zeroFromEndRotation = getZeroEndRotation(endRotation);
    var ballEndRotation =
      getBallNumberOfRotations(wheelMinNumberOfSpins, wheelMaxNumberOfSpins) +
      getBallEndRotation(zeroFromEndRotation, currentNumber);
    
    anime.set([".layer-2", ".layer-4"], {
      rotate: function () {
        return lastNumberRotation;
      }
    });
    anime.set(".ball-container", {
      rotate: function () {
        return 0;
      }
    });

    anime({
      targets: [".layer-2", ".layer-4"],
      rotate: function () {
        return endRotation; 
      },
      duration: singleSpinDuration,
      easing: `cubicBezier(${bezier.join(",")})`,
      complete: function (anim: any) {
        lastNumber = currentNumber;
      }
    });
  
    anime({
      targets: ".ball-container",
      translateY: [
        { value: 0, duration: 2000 },
        { value: 20, duration: 1000 },
        { value: 25, duration: 900 },
        { value: 50, duration: 1000 }
      ],
      rotate: [{ value: ballEndRotation, duration: singleSpinDuration }],
      loop: 1,
      easing: `cubicBezier(${bezier.join(",")})`
    });
  }

  useEffect(() => {
    var nextNubmer = props.number.next;
    if (nextNubmer != null && nextNubmer !== "") {
      var nextNumberInt = parseInt(nextNubmer);
      spinWheel(nextNumberInt);
    }
  }, [props.number]);

  return (
    <div className={"roulette-wheel"}>
      <div
        className={"layer-2 wheel"}
        style={{ transform: "rotate(0deg)" }}
      ></div>
      <div className={"layer-3"}></div>
      <div
        className={"layer-4 wheel"}
        style={{ transform: "rotate(0deg)" }}
      ></div>
      <div className={"layer-5"}></div>
      <div className={"ball-container"} style={{ transform: "rotate(0deg)" }}>
        <div
          className={"ball"}
          style={{ transform: "translate(0, -163.221px)" }}
        ></div>
      </div>
      {/* <svg width="380" height="380">
        <circle cx="190" cy="190" r="190" style={{touch-action: 'none'}}></circle>
      </svg> */}
    </div>
  );
};

export default Wheel;
