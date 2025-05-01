// Welcome to Jet.js!
// This is a simple starter example to show how components, data, and templates work together.
// Feel free to play around and make it your own! 🚀


// A simple example showcasing:
// - Dynamic data and dynamic classes
// - A child component with data passed as a prop
// - Looping through an array
// - Template defined as a string
// - Template defined as a function

com({
    name: 'my-app',
    data: {
        logo: 'Jet.js',
        title: 'My First App',
        effect: 'e-flame',
        size: 'fs-40',
        color: 'tx-blue',
        menu: [
            { title: 'Jet Home', url: 'http://magicjet.org/' },
            { title: 'Documentation', url: 'http://magicjet.org/docs/' },
            { title: 'Support Forum', url: 'http://support.magicjet.org/forums/' },
        ]
    },
    // Template as a string
    tpl: `
        <h1 class="mb-2 jc-c" :class="effect size color">{{logo}}</h1>
        <h2 class="jc-c">{{title}}</h2>
        <child-component prop:menu="menu">Button</child-component>
    `
});

com({
    name: 'child-component',
    // No local data — uses a prop instead
    // Template as a function
    tpl() {
        return html`
            <ul class="g-1 jc-c">
                <li j-for="menu">
                    <a href="[e.url]" target="_blank">[e.title]</a>
                </li>
            </ul>
        `;
    },
});
