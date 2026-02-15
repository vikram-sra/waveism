# Contributing to Waveism

Thank you for your interest in contributing to **Waveism**! This project aims to make fundamental physics concepts accessible through beautiful, interactive visualizations.

## 🚀 Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/waveism.git
   cd waveism
   ```

2. **Run a local server**
   
   No build step required! Just serve the files:
   
   ```bash
   # Python 3
   python3 -m http.server 8000
   
   # Node.js
   npx serve .
   ```

3. **Open in browser**
   
   Navigate to `http://localhost:8000`

---

## 📋 How to Contribute

### Reporting Bugs

- Use the GitHub issue tracker
- Include browser version, OS, and steps to reproduce
- Screenshots/GIFs are helpful for visual issues

### Suggesting Enhancements

- Open an issue with the `enhancement` label
- Describe the physics concept or feature clearly
- Explain why it would be valuable

### Pull Requests

1. **Fork** the repository
2. **Create a branch** for your feature (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** with clear messages
4. **Test thoroughly** across browsers (Chrome, Safari, Firefox)
5. **Push** to your fork
6. **Open a Pull Request** with a detailed description

---

## 🎨 Design Guidelines

- **Visual Excellence**: Maintain the cyberpunk/sci-fi aesthetic
- **Performance**: Keep animations smooth (60fps target)
- **Mobile-First**: Ensure iOS/touch compatibility
- **Accessibility**: Use semantic HTML and ARIA labels where needed

---

## 🧪 Code Standards

### HTML/CSS
- Use semantic HTML5 elements
- Maintain the existing design system (CSS variables in `:root`)
- Keep mobile-responsive with `@media` queries

### JavaScript
- Vanilla JS preferred (no frameworks)
- Use ES6+ features (arrow functions, const/let, template literals)
- Comment complex physics calculations
- Keep Three.js visualizations performant

### File Structure
- New visualizations go in root as `{concept}.html`
- Shared utilities in `components/`
- Assets in `assets/` or `icons/`

---

## 📚 Physics Accuracy

- **Cite sources** for complex concepts
- **Balance** educational accuracy with visual clarity
- **Explain equations** in the info modals
- Avoid oversimplification that misleads

---

## 🙏 Recognition

All contributors will be acknowledged in the README. Significant contributions may earn you a mention in the project credits.

---

**Questions?** Open an issue or reach out to the maintainers.

*Built with curiosity about the fundamental nature of reality.*
