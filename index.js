function fadeInOnScroll() {
    const elementsToFade = document.querySelectorAll(".fade-in");
  
    elementsToFade.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight * 0.6;
  
      if (elementTop < windowHeight) {
        element.classList.add("is-visible");
      } else {
        element.classList.remove("is-visible");
      }
    });
  }
  
  window.addEventListener("scroll", fadeInOnScroll);

  function getAspectRatio() {
    if (window.innerWidth / window.innerHeight < 1) {
      return "portrait";
    }
  }
  