import { useEffect, useState, useCallback } from "react"

export default function Home() {
  const [word, setWord] = useState("");
  const [guess, setGuess] = useState("");
  const [correct, setCorrect] = useState(false);
  const [colors, setColors] = useState([]);
  
  const [guesses, setGuesses] = useState([]);
  const [numGuesses, setNumGuesses] = useState(0);
  const [alphColors, setAlphColors] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const [notSelectedWords, setNotSelectedWords] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [mobile, setMobile] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [words, setWords] = useState([]); 

  const alphabet = [
    'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
    'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
    'Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<<'
  ];

  const getDefinition = async (wrd) => {
    let url = `https://api.dictionaryapi.dev/api/v2/entries/en/${wrd}`;

    return await fetch(url)
      .then(res => res.json())
      .then(data => { return data; })
      .catch(err => console.log(err));
  }

  const getAllDefinitions = async (data) => {
    let definitions = [];

    await Promise.all(data.map((word, _) => {
      let meanings = word.meanings;
      meanings.map((mean, _) => {
        let defines = mean.definitions;
        defines.map((def, _) => {
          definitions.push(def.definition);
        })
      })
    }))

    return definitions;
  }

  const startGame = async (validWords) => {
    setDisabled(true);

    let placeholderGuesses = [];
    let placeholderColors = [];
    let rowColors = [];
    let alpColors = [];

    let randomNumber = Math.floor(Math.random() * validWords.length);
    let word = validWords[randomNumber];
    
    validWords = JSON.parse(JSON.stringify(validWords));
    validWords.splice(randomNumber, 1);

    getDefinition(word).then(data => {
      if (data.length > 0) {
        getAllDefinitions(data).then(allDef => {
          setDefinitions(allDef);
        });
      }
    })

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

    setGuesses(placeholderGuesses);
    setColors(placeholderColors);
    setAlphColors(alpColors);
    setWord(word.toUpperCase());
    setNumGuesses(0);

    setGuess("");
    setCorrect(false);
    setDefinitions([]);
    setDisabled(false);
    setNotSelectedWords(validWords);
  }

  const changeGuess = (value) => {
    let copyGuesses = JSON.parse(JSON.stringify(guesses));
    let copyColor = JSON.parse(JSON.stringify(colors));
    
    let cpyGuess = "";
    let cpyColor = [];

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

  const submitGuess = () => {
    if (guess.length != 5 || correct || numGuesses == 6) return;

    let regText = new RegExp(`^${guess.toLowerCase()}$`);
    let valid = words.filter(d => regText.test(d)).length > 0;

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

  const validateLetter = (letter, code = null) => {
    let cpyGuess = guess;

    if (letter == "Enter") {
      submitGuess();
    } else if (letter == "Backspace" || letter == "<<") {
      if (cpyGuess.length == 0) return;
      cpyGuess = cpyGuess.substring(0, cpyGuess.length - 1);
      changeGuess(cpyGuess);
      setGuess(cpyGuess);
    } else {
      if (cpyGuess.length == 5) return;
      if (code && code.indexOf("Key") == -1) return;
      cpyGuess += letter.toUpperCase();
      changeGuess(cpyGuess);
      setGuess(cpyGuess); 
    }
  }

  const typeMessage = useCallback(e => {
    let letter = e.key;
    let code = e.code;

    if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) return;
    if (correct || numGuesses == 6) return;
    validateLetter(letter, code);

  }, [validateLetter, correct, numGuesses])

  const onClick = (e) => {
    e.preventDefault();

    let letter = e.target.id;
    if (correct || numGuesses == 6) return;
    validateLetter(letter);
  }

  useEffect(() => {
    setMobile(window.innerWidth < 600);

    const getAllWords = async () => {
      return await fetch("/api/getWords").then(res => res.json())
        .then(data => { return data; }).catch(err => console.error(err));
    }

    getAllWords().then(data => {
      if (data.message === "Error") {
        console.error(data.error);
      } else {
        startGame(data.message).then(() => {
          setWords(data.message);
          setLoaded(true);
        })
      }
    })

  }, [])

  useEffect(() => {
    window.addEventListener("resize", () => {
      setMobile(window.innerWidth < 600);
    });

    return () => {
      window.removeEventListener("resize", () => {
        setMobile(window.innerWidth < 600);
      });
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', typeMessage);
    return (() => {
      window.removeEventListener('keydown', typeMessage);
    })
  }, [typeMessage])

  if (!loaded) {
    return (
      <div className="flex h-screen">
        <div className="m-auto">
          <svg className="animate-spin h-10 w-10 mr-3 text-white" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className={`${loaded ? "" : "hidden"} flex h-screen`}>
        <div className="select-none m-auto flex-1">
          {numGuesses == 6 || correct ? (
            <center>
              <div className={`text-xl ${correct ? "hidden" : ""}`}>
                Word was: {word}
              </div>
              <button disabled={disabled || notSelectedWords.length == 0} onClick={() => startGame(notSelectedWords)} className={`disabled:opacity-60 disabled:cursor-default mt-1 py-1 px-2 rounded-lg hover:text-black hover:bg-slate-400`}>New Game</button>
          </center>
          ) : ""}

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

          {(numGuesses == 6 || correct) && mobile ? (
            <div className={`m-auto mx-4 flex flex-col`}>
              <div className="font-black">{word.toLowerCase()}</div>
              {definitions.slice(0, 5).map((defines, i) => {
                return <div key={i}>{i+1}. {defines}</div>
              })}
            </div>
          ) : ""}
        </div>

        {(numGuesses == 6 || correct) && !mobile ? (
          <div className={`scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-inherit max-h-96 m-auto overflow-auto pr-3 scroll-x-auto w-2/3 flex flex-1 flex-col`}>
            <div className="m-auto">
              <div className="font-black">{word.toLowerCase()}</div>
              {definitions.map((defines, i) => {
                return <div key={i}>{i+1}. {defines}</div>
              })}
            </div>
            </div>
          ) : ""}
      </div>
    </>
  )
}