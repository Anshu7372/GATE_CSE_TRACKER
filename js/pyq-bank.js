/* GATE CSE PYQ bank — filled from the official question papers + answer keys you provide.
   Each question:
   {
     id:  "2019-23"          unique id (year-[set-]number)
     y:   2019               year
     set: 1                  paper set (only for multi-set years), optional
     n:   23                 question number in the paper
     m:   1 | 2              marks
     ty:  "MCQ" | "MSQ" | "NAT"
     sid: "os"               subject id (see js/syllabus.js)
     ti:  12                 topic index inside the subject
     sj:  1                  subtopic index inside the topic
     q:   "question text"    plain text (code/maths as text), optional if img is given
     opts:["..","..","..",".."]  option texts (MCQ/MSQ), optional if they are in img
     img: "pyq/img/2019-23.webp" cropped question image from the paper (keeps figures/maths exact), optional
     ans: "B" (MCQ) | "AC" (MSQ) | [lo, hi] (NAT range)
     concept: "what the question tests", optional
     trap:    "common mistake", optional
   }
*/
const PYQ_BANK = {
  papers: {},
  q: [],
};
