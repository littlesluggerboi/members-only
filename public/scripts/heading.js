let visible = false;
const profile = document.querySelector("#profile");
const user = profile.querySelector(".user");
const info = profile.querySelector(".info");
function setVisible(bool) {
  visible = bool;
  if (bool) {
    info.style.visibility = "visible";
  } else {
    info.style.visibility = "hidden";
  }
}
user.addEventListener("click", () => {
  setVisible(!visible);
});

window.onclick = (e) => {
  const target = e.target;
  if (!target.matches(".user")) {
    setVisible(false);
  }
};
