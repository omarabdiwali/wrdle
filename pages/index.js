import { useEffect, useState, useCallback, useRef } from "react"
import { words } from 'popular-english-words';
import Head from "next/head";

var allWords = require('an-array-of-english-words')
let validWords = allWords.filter(d => d.length == 5);

let wrdle = words.getMostPopularLength(1000, 5);

export default function Home() {
  const [word, setWord] = useState("");
  const [guess, setGuess] = useState("");
  const [correct, setCorrect] = useState(false);
  const [colors, setColors] = useState([]);
  
  const [guesses, setGuesses] = useState([]);
  const [numGuesses, setNumGuesses] = useState(0);
  const [alphColors, setAlphColors] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const inpRef = useRef(null);
  const alphabet = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<<'];

  const keepFocus = useCallback(e => {
    if (inpRef) {
      inpRef.current.focus();
    }
  }, [])

  const autoFocusFn = useCallback(element => {
    if (element) {
      element.focus();
    }
  }, []);

  useEffect(() => {
    window.addEventListener('blur', keepFocus);
    return () => {
      window.addEventListener('blur', keepFocus);
    }
  }, [keepFocus])

  useEffect(() => {
    window.addEventListener("click", keepFocus);
    return () => {
      window.addEventListener("click", keepFocus);
    }
  }, [keepFocus])
  
  useEffect(() => {
    let gs = [];
    let cls = [];
    let cnt = [];
    let alpColors = [];

    let randomNumber = Math.floor(Math.random() * 1000);
    let word = wrdle[randomNumber];

    let regText = new RegExp(`^${word}$`);
    let valid = validWords.filter(d => regText.test(d)).length > 0;

    while (!valid) {
      randomNumber = Math.floor(Math.random() * 1000);
      word = wrdle[randomNumber];
      regText = new RegExp(`^${word}$`);
      valid = validWords.filter(d => regText.test(d)).length > 0;
    }

    for (let i = 0; i < 6; i++) {
      gs.push("     ")
    }

    for (let i = 0; i < 25; i++) {
      if (cnt.length == 5) {
        cls.push(cnt);
        cnt = []
      }

      cnt.push("bg-slate-400");

      if (i == 19) {
        alpColors.push("bg-slate-500 text-xs text-black");
      } else {
        alpColors.push("bg-slate-500 text-black");
      }
    }

    cls.push(cnt);
    cls.push(["bg-slate-400", "bg-slate-400", "bg-slate-400", "bg-slate-400", "bg-slate-400"])
    alpColors.push("bg-slate-500 text-black");
    alpColors.push("bg-slate-500 text-black");
    alpColors.push("bg-slate-500 text-xs text-black");

    setGuesses(gs);
    setColors(cls);
    setAlphColors(alpColors);
    setWord(word.toUpperCase());
    setLoaded(true);
  }, [])

  const onChange = (e, othValue=null) => {
    e.preventDefault();
    let copyGuesses = JSON.parse(JSON.stringify(guesses));
    let copyColor = JSON.parse(JSON.stringify(colors));
    
    let cpyGuess = "";
    let cpyColor = [];
    let value = "";

    if (othValue == null) {
      value = e.target.value.trim().toUpperCase();
    } else {
      value = othValue;
    }
    
    if (value == guess || value.indexOf(" ") > -1 || correct) return;

    let alph = new RegExp(`^[A-Za-z]+$`);
    if (!alph.test(value) && value.length > 0) return;

    if (value.length <= 5) {
      setGuess(value);
      let remaining = 5 - value.length;
      
      for (let i = 0; i < value.length; i++) {
        cpyGuess += value[i];
        cpyColor.push("bg-slate-400 text-black");
      }

      for (let i = 0; i < remaining; i++) {
        cpyGuess += " ";
        cpyColor.push("bg-slate-400");
      }

      copyGuesses[numGuesses] = cpyGuess;
      copyColor[numGuesses] = cpyColor;
      setGuesses(copyGuesses);
      setColors(copyColor);
    }
  }

  const onSubmit = (e) => {
    e.preventDefault();
    if (guess.length != 5 || correct || numGuesses == 6) return;

    let regText = new RegExp(`^${guess.toLowerCase()}$`);
    let valid = validWords.filter(d => regText.test(d)).length > 0;

    if (!valid) return;

    let colorArr = [];
    let remArr = [];
    let count = 0;

    let uniq = [...word].reduce((a, e) => { a[e] = a[e] ? a[e] + 1 : 1; return a }, {});
    
    let copyColor = JSON.parse(JSON.stringify(colors));
    let copyGuesses = JSON.parse(JSON.stringify(guesses));
    let copyAlpColor = JSON.parse(JSON.stringify(alphColors));

    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      const gLetter = guess[i];

      let index = alphabet.indexOf(gLetter);

      if (letter == gLetter) {
        colorArr.push("bg-green-600 text-black");
        copyAlpColor[index] = "bg-green-600 text-black";
        uniq[letter] -= 1;
        count += 1;
      } else {
        colorArr.push("");
        remArr.push(i);
      }
    }

    for (let i = 0; i < remArr.length; i++) {
      let index = remArr[i];
      const letter = guess[index];

      let clrIndex = alphabet.indexOf(letter);

      if (uniq[letter] > 0) {
        if (copyAlpColor[clrIndex] != "bg-green-600 text-black") {
          copyAlpColor[clrIndex] = "bg-orange-400 text-black";
        }
        colorArr[index] = "bg-orange-400 text-black";
        uniq[letter] -= 1;
      } else {
        if (copyAlpColor[clrIndex] == "bg-slate-500 text-black") {
          copyAlpColor[clrIndex] = "bg-stone-600 text-black";
        }
        colorArr[index] = "bg-stone-600 text-black";
      }
    }

    if (count == guess.length) setCorrect(true);
    
    copyColor[numGuesses] = colorArr;
    copyGuesses[numGuesses] = guess;

    setColors(copyColor);
    setGuesses(copyGuesses);
    setAlphColors(copyAlpColor);
    setGuess("");
    setNumGuesses(numGuesses + 1);
  }

  const onClick = (e) => {
    let cpyGuess = guess;
    let letter = e.target.id;

    if (correct || numGuesses == 6) return;

    if (letter == "Enter") {
      onSubmit(e);
      return;
    } else if (letter == "<<") {
      if (cpyGuess.length > 0) {
        cpyGuess = cpyGuess.substring(0, cpyGuess.length - 1);
        onChange(e, cpyGuess);
        setGuess(cpyGuess);
      }

      return;
    }

    if (cpyGuess.length < 5) {
      cpyGuess += letter;
      onChange(e, cpyGuess);
      setGuess(cpyGuess);
    }
  }

  return (
    <>
      <Head>
        <title>Wrdle</title>
      </Head>

      <div className={`${loaded ? "" : "hidden"} flex h-screen`}>
        <div className="select-none m-auto">
          <form onSubmit={onSubmit} className={`opacity-0 ${numGuesses == 6 && !correct ? "hidden" : ""}`}>
            <input ref={(el)=> {inpRef.current = el; autoFocusFn(el);}} disabled={correct} placeholder="Guess..." type="text" className="bg-inherit" value={guess} onChange={onChange}></input>
          </form>      

          <center>
            <div className={`text-xl ${numGuesses == 6 && !correct ? "" : "hidden"}`}>
              Word was: {word}
            </div>
          </center>

          <center>
            <div className="inline-grid text-white m-5 gap-2 grid-cols-5 text-2xl">
            {guesses.map((guss, i) => {
              let letters = guss.split("");
              let color = colors[i];

              return letters.map((letr, j) => {
                return <div className={`${color[j]} w-12 h-12 rounded-lg flex`} key={j}>
                  <div className="m-auto">{letr}</div>
                </div>
              })
            })}
            </div>
          </center>

          <div className="flex flex-col space-y-4 mt-3 m-auto">
            <div className="inline-grid gap-2 grid-cols-10 m-auto text-2xl">
              {alphabet.slice(0, 10).map((letter, i) => {
                let color = alphColors[i];

                return <div onClick={onClick} className={`${color} cursor-pointer w-12 h-12 rounded-lg flex`} id={letter} key={i}>
                  <div id={letter} className="m-auto">{letter}</div>
                </div>
              })}
            </div>
              
            <div className="inline-grid gap-2 grid-cols-9 m-auto text-2xl">
            {alphabet.slice(10, 19).map((letter, i) => {
              i += 10;
              let color = alphColors[i];

              return <div onClick={onClick} className={`${color} cursor-pointer w-12 h-12 rounded-lg flex`} id={letter} key={i}>
                <div id={letter} className="m-auto">{letter}</div>
              </div>
            })}
            </div>

            <div className="inline-grid gap-2 grid-cols-9 m-auto text-2xl">
            {alphabet.slice(19).map((letter, i) => {
              i += 19;
              let color = alphColors[i];

              return <div onClick={onClick} className={`${color} cursor-pointer w-12 h-12 rounded-lg flex`} id={letter} key={i}>
                <div id={letter} className="m-auto">{letter}</div>
              </div>
            })}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
