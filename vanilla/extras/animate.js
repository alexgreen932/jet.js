// animate.js

// Animate a single item when it enters the viewport
function observeItem(item, animationClass) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      // Извлекаем значение задержки из класса jd-XXX
      let delay = 250; // дефолтная задержка
      const classList = Array.from(item.classList);
      
      // Ищем класс, начинающийся с 'jd-'
      const delayClass = classList.find(cls => cls.startsWith('jd-'));
      if (delayClass) {
        // Извлекаем числовое значение после 'jd-'
        const delayValue = delayClass.replace('jd-', '');
        if (!isNaN(delayValue) && delayValue.trim() !== '') {
          delay = parseInt(delayValue, 10);
        }
      }

      if (entry.isIntersecting) {
        setTimeout(() => {
          item.classList.add('jp', animationClass);
          item.classList.remove('ja', 'opacity-0');
        }, delay);
      } else {
        item.classList.remove('jp', animationClass);
        item.classList.add('ja', 'opacity-0');
      }
    });
  }, { threshold: [0.25] });

  observer.observe(item);
}

// Animate a group of children with staggered delays
function observeGroup(group, animationClass) {
  const children = Array.from(group.children);

  children.forEach(child => {
    if (!child.classList.contains('el-exclude')) {
      child.classList.add('opacity-0');
    }
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        children.forEach((child, index) => {
          if (!child.classList.contains('el-exclude')) {
            // Для групп используем стандартную ступенчатую задержку 250мс
            const delay = 250 * (index + 1);
            setTimeout(() => {
              child.classList.add('jp', animationClass);
              child.classList.remove('ja', 'opacity-0');
            }, delay);
          }
        });
      } else {
        children.forEach(child => {
          if (!child.classList.contains('el-exclude')) {
            child.classList.remove('jp', animationClass);
            child.classList.add('ja', 'opacity-0');
          }
        });
      }
    });
  }, { threshold: [0.25] });

  observer.observe(group);
}

// Find and setup all animations on the page
function animate() {
  // Animate individual items
  const items = document.querySelectorAll('.ja');
  items.forEach(item => {
    const animationClass = Array.from(item.classList).find(cls => cls.startsWith('ja-'));
    if (animationClass) {
      item.classList.add('opacity-0');
      item.classList.remove(animationClass);
      observeItem(item, animationClass);
    }
  });

  // Animate grouped items
  const groups = document.querySelectorAll('.jag');
  groups.forEach(group => {
    const animationClass = Array.from(group.classList).find(cls => cls.startsWith('ja-'));
    if (animationClass) {
      observeGroup(group, animationClass);
    }
  });
}

// Start observing DOM changes and trigger animations
function startObserver() {
  const observer = new MutationObserver(() => {
    animate(); // Re-run animate for new elements
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  animate(); // Initial run
}

// Exported initialize function
export default function initializeAnimation() {
  if (document.body) {
    startObserver();
  } else {
    document.addEventListener('DOMContentLoaded', startObserver);
  }
}
