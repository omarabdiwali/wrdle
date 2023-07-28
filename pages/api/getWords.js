import { readFileSync } from 'fs';

export default async function handler(req, res) {
  let file = process.cwd() + `/public/files/words.txt`;
  
  try {
    let words = readFileSync(file, 'utf-8');
    words = words.replace(/\r?\n/g, "");
    let arr = words.split(",");
    
    res.status(200).json({ message: arr });
  }
  
  catch (err) {
    res.status(400).json({ message: "Error", error: err });
  }
}