const checkbox = document.querySelector("input#approval");
const questionaire = document.querySelector("#club_questionaire");

const createQuestionaire = () => {
  const questionLabel = document.createElement("label");
  questionLabel.setAttribute("for", "question");
  questionLabel.textContent = "Approval Question";

  const questionTA = document.createElement("textarea");
  questionTA.setAttribute("required", "true");
  questionTA.setAttribute("id", "question");
  questionTA.setAttribute("name", "question");
  questionTA.setAttribute("rows", 5);
  questionTA.setAttribute(
    "placeholder",
    "Write a question to welcome aspiring members..."
  );

  const answerLabel = document.createElement("label");
  answerLabel.setAttribute("for", "answer");
  answerLabel.textContent = "Approval Answer";

  const answerTA = document.createElement("textarea");
  answerTA.setAttribute("required", "true");
  answerTA.setAttribute("id", "answer");
  answerTA.setAttribute("name", "answer");
  answerTA.setAttribute("placeholder", "Enter answer to the question...");

  return [questionLabel, questionTA, answerLabel, answerTA]
};

const click = (e)=>{
    const isChecked = e.target.checked;
    if(!isChecked){
        questionaire.style.visibility = "visible";
        questionaire.replaceChildren(...createQuestionaire())
    }else{
        questionaire.replaceChildren([])   
        questionaire.style.visibility = "hidden";
    }
}

checkbox.addEventListener("change", click)





