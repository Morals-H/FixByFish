    //load head
  function loadHead() {
    fetch('/data/head.html')
      .then(res => res.text())
      .then(data => {
        document.getElementById("head").innerHTML = data;
      })
      .catch(err => console.error("Error loading Navbar:", err));
  }

  //load navbar
  function loadNav() {
    fetch('/data/navbar.html')
      .then(res => res.text())
      .then(data => {
        document.getElementById("navbar").innerHTML = data;
      })
      .catch(err => console.error("Error loading Navbar:", err));
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
    loadFooter();
  });