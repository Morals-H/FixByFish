    //load head
  function loadHead() {
    fetch('/data/head.html')
      .then(res => res.text())
      .then(data => {
        document.getElementById("head").innerHTML = data;
      })
      .catch(err => console.error("Error loading head:", err));
  }

    //load footer
    function loadRec() {
      fetch('/data/recommended.html')
        .then(res => res.text())
        .then(data => {
          document.getElementById("recommended").innerHTML = data;
        })
        .catch(err => console.error("Error loading recommended:", err));
    }

  //load navbar
  function loadNav() {
    fetch('/data/navbar.html')
      .then(res => res.text())
      .then(data => {
        document.getElementById("navbar").innerHTML = data;
      })
      .catch(err => console.error("Error loading navbar:", err));
  }

    //load footer
    function loadFooter() {
    fetch('/data/footer.html')
      .then(res => res.text())
      .then(data => {
        document.getElementById("footer").innerHTML = data;
      })
      .catch(err => console.error("Error loading footer:", err));
  }
  
    // Initialize everything when the DOM is ready
    document.addEventListener("DOMContentLoaded", () => {
    loadHead();
    loadNav();
    loadRec();
    loadFooter();
  });