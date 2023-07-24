import { useEffect, useState, useCallback, useRef } from "react"
import Head from "next/head";

var allWords = require('an-array-of-english-words');
let validWords = allWords.filter(d => d.length == 5);

export default function Home() {
  const [word, setWord] = useState("");
  const [guess, setGuess] = useState("");
  const [correct, setCorrect] = useState(false);
  const [colors, setColors] = useState([]);
  
  const [guesses, setGuesses] = useState([]);
  const [numGuesses, setNumGuesses] = useState(0);
  const [alphColors, setAlphColors] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [prevWords, setPrevWords] = useState({});
  const [definitions, setDefinitions] = useState([]);
  const [mobile, setMobile] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const [hasDef, setHasDef] = useState({});

  const inpRef = useRef(null);
  const alphabet = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<<'];

  const keepFocus = useCallback(e => {
    if (inpRef) {
      inpRef.current.focus({ preventScroll: true });
    }
  }, [])

  const autoFocusFn = useCallback(element => {
    if (element) {
      element.focus({ preventScroll: true });
    }
  }, []);

  const getDefinition = async (wrd) => {
    let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${wrd}`;

    return await fetch(url)
      .then(res => res.json())
      .then(data => { return data; })
      .catch(err => console.log(err));
  }

  const startGame = async () => {    
    setDisabled(true);

    let placeholderGuesses = [];
    let placeholderColors = [];
    let rowColors = [];
    let alpColors = [];

    let prevCopy = JSON.parse(JSON.stringify(prevWords));
    let randomNumber = Math.floor(Math.random() * validWords.length);
    let defCopy = JSON.parse(JSON.stringify(hasDef));
    let word = validWords[randomNumber];

    let data;

    if (defCopy[word] == undefined) {
      data = await getDefinition(word);
      defCopy[word] = data.message == undefined;
    }

    while (prevCopy[word] || defCopy[word] == false) {
      randomNumber = Math.floor(Math.random() * validWords.length);
      word = validWords[randomNumber];

      if (defCopy[word] == undefined) {
        data = await getDefinition(word);
        defCopy[word] = data.message == undefined;
      }
    }

    for (let i = 0; i < 6; i++) {
      placeholderGuesses.push("     ")
    }

    for (let i = 0; i < 25; i++) {
      if (rowColors.length == 5) {
        placeholderColors.push(rowColors);
        rowColors = []
      }

      rowColors.push("bg-slate-400");

      if (i == 19) {
        alpColors.push("bg-slate-500 text-xs text-black");
      } else {
        alpColors.push("bg-slate-500 text-black");
      }
    }

    placeholderColors.push(rowColors);
    placeholderColors.push(["bg-slate-400", "bg-slate-400", "bg-slate-400", "bg-slate-400", "bg-slate-400"]);
    alpColors.push("bg-slate-500 text-black");
    alpColors.push("bg-slate-500 text-black");
    alpColors.push("bg-slate-500 text-xs text-black");

    prevCopy[word] = 1;

    setGuesses(placeholderGuesses);
    setColors(placeholderColors);
    setAlphColors(alpColors);
    setWord(word.toUpperCase());
    setHasDef(defCopy);
    
    setNumGuesses(0);
    setGuess("");
    setCorrect(false);
    setPrevWords(prevCopy);
    setDefinitions([]);
    setDisabled(false);
  }

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
    if (window.innerWidth < 570) {
      setMobile(true);
    }
    startGame().then(() => {
      setLoaded(true);
    });
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

  const getAllDefintions = async (data) => {
    let definitions = [];

    await Promise.all(data.map((word, _) => {
      let meanings = word.meanings;
      meanings.map((mean, _) => {
        let defines = mean.definitions;
        defines.map((def, _) => {
          definitions.push(def.definition)
        })
      })
    }))

    return definitions.slice(0, 5);
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

    if (numGuesses + 1 == 1) {
      getDefinition(word.toLowerCase()).then(data => {
        if (data.length > 0) {
          getAllDefintions(data).then(allDef => {
            setDefinitions(allDef);
          });
        }
      })
    }

    copyColor[numGuesses] = colorArr;
    copyGuesses[numGuesses] = guess;

    setColors(copyColor);
    setGuesses(copyGuesses);
    setAlphColors(copyAlpColor);
    setGuess("");
    setNumGuesses(numGuesses + 1);
  }

  const onClick = (e) => {
    e.preventDefault();
    
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

  const prevent = (e) => {
    e.preventDefault();
  }

  return (
    <>
      <Head>
        <title>Wrdle</title>
      </Head>

      <div className={`${loaded ? "" : "hidden"} flex h-screen`}>
        <div className="select-none m-auto">
          <form onSubmit={onSubmit} className={`fixed opacity-0 ${numGuesses == 6 || correct ? "hidden" : ""}`}>
            <input onPaste={prevent} onCut={prevent} ref={(el)=> {inpRef.current = el; autoFocusFn(el);}} disabled={correct} placeholder="Guess..." type="text" className="bg-inherit pointer-events-none cursor-default" value={guess} onChange={onChange}></input>
          </form>      

          <center>
            <div className={`text-xl ${numGuesses == 6 && !correct ? "" : "hidden"}`}>
              Word was: {word}
            </div>
            <button disabled={disabled} onClick={startGame} className={`${correct || numGuesses == 6 ? "" : "hidden"} disabled:opacity-60 disabled:cursor-default mt-1 py-1 px-2 rounded-lg hover:text-black hover:bg-slate-400`}>New Game</button>
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

          <div className={`flex flex-col space-y-4 mt-3 m-auto ${(correct || numGuesses == 6) && definitions.length > 0 ? "hidden" : ""}`}>
            <div className="inline-grid gap-2 grid-cols-10 m-auto text-2xl">
              {alphabet.slice(0, 10).map((letter, i) => {
                let color = alphColors[i];

                return <div onClick={onClick} className={`${color} cursor-pointer ${mobile ? "w-8 h-8" : "w-12 h-12"} rounded-lg flex`} id={letter} key={i}>
                  <div id={letter} className="m-auto">{letter}</div>
                </div>
              })}
            </div>
              
            <div className="inline-grid gap-2 grid-cols-9 m-auto text-2xl">
            {alphabet.slice(10, 19).map((letter, i) => {
              i += 10;
              let color = alphColors[i];

              return <div onClick={onClick} className={`${color} cursor-pointer ${mobile ? "w-8 h-8" : "w-12 h-12"} rounded-lg flex`} id={letter} key={i}>
                <div id={letter} className="m-auto">{letter}</div>
              </div>
            })}
            </div>

            <div className="inline-grid gap-2 grid-cols-9 m-auto text-2xl">
            {alphabet.slice(19).map((letter, i) => {
              i += 19;
              let color = alphColors[i];

              return <div onClick={onClick} className={`${color} cursor-pointer ${mobile ? "w-8 h-8" : "w-12 h-12"} rounded-lg flex`} id={letter} key={i}>
                <div id={letter} className="m-auto">{letter}</div>
              </div>
            })}
            </div>
          </div>
          <div className={`m-auto mx-3 flex flex-col ${(correct || numGuesses == 6) && definitions.length > 0 ? "" : "hidden"}`}>
            <div className="font-black">{word.toLowerCase()}</div>
            {definitions.map((defines, i) => {
              return <div key={i}>{i+1}. {defines}</div>
            })}
          </div>
        </div>
      </div>
    </>
  )
}
