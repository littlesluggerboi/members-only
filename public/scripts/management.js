const pages = document.querySelector(".pages");
const output = document.querySelector(".output");

let page = 0;
const setPage = (pageNumber) => {
  pages.children[page].classList.remove("selected_page");
  output.children[page].classList.remove("selected_child");
  page = pageNumber;
  pages.children[page].classList.add("selected_page");
  output.children[page].classList.add("selected_child");
};

for (let i = 0; i < pages.children.length; i++) {
  pages.children[i].addEventListener("click", () => setPage(i));
}

const confirmRedirect = (message, e) => {
  e.preventDefault();
  const target = e.target;
  const res = confirm(message);
  if (res) {
    window.location.href = target.href;
  }
};

const messages = document.querySelectorAll(".message_action a");
for (let message of messages) {
  message.addEventListener("click", (e) => {
    confirmRedirect("Are you sure you want to delete this message?", e);
  });
}

const revokes = document.querySelectorAll(".member_action > a.leave");
for (let revoke of revokes) {
  revoke.addEventListener("click", (e) => {
    confirmRedirect("Are you sure you want to revoke this membership?", e);
  });
}

const promotes = document.querySelectorAll(".member_action > a.join");
for (let promote of promotes) {
  promote.addEventListener("click", (e) => {
    confirmRedirect(
      "Only one admin is allowed in a club. As such by promoting a member, you are going to pass your admin privileges. Confirm to conitnue.",
      e
    );
  });
}

const removeApproval = document.querySelector(".questionaire > a");
if (removeApproval) {
  removeApproval.addEventListener("click", (e) => {
    confirmRedirect(
      "Are you sure you want to remove the club approval questionnaire? By removing it, everybody can be a member of this club.",
      e
    );
  });
}
