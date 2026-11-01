// Add the portfolio's connected square clusters to Markdown level-two headings.
export default function rehypeHeadingSquares() {
    const textContent = (node) => node.value ?? (node.children ?? []).map(textContent).join('');

    function decoration(seed, corner) {
        let state = 2166136261;
        for (const char of `${seed}:${corner}`) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
        const random = () => {
            state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
            return state / 4294967296;
        };
        const count = 5 + Math.floor(random() * 7);
        const origin = { x: Math.floor(random() * 5), y: Math.floor(random() * 5) };
        const fillChance = 0.15 + random() * 0.35;
        const cells = [origin];
        const occupied = new Set([`${origin.x},${origin.y}`]);
        while (cells.length < count) {
            const candidates = new Map();
            for (const cell of cells) {
                for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
                    const x = cell.x + dx;
                    const y = cell.y + dy;
                    const key = `${x},${y}`;
                    if (x >= 0 && x < 5 && y >= 0 && y < 5 && !occupied.has(key)) {
                        candidates.set(key, { x, y });
                    }
                }
            }
            const options = [...candidates.values()];
            const next = options[Math.floor(random() * options.length)];
            occupied.add(`${next.x},${next.y}`);
            cells.push(next);
        }
        return {
            type: 'element', tagName: 'svg',
            properties: {
                className: ['heading-squares', `heading-squares-${corner}`],
                ariaHidden: 'true', focusable: 'false', viewBox: '0 0 100 100',
                width: 100, height: 100, fill: 'none',
            },
            children: cells.map(({ x, y }) => ({
                type: 'element', tagName: 'rect',
                properties: {
                    x: (corner === 'top' ? 4 - x : x) * 20,
                    y: (corner === 'bottom' ? 4 - y : y) * 20,
                    width: 20, height: 20,
                    fill: random() < fillChance ? 'currentColor' : 'none', fillOpacity: 0.12,
                    stroke: 'currentColor', strokeWidth: 0.75,
                    opacity: Math.max(0.18, 1 - (Math.abs(x - origin.x) + Math.abs(y - origin.y)) * 0.17),
                }, children: [],
            })),
        };
    }

    return (tree, file) => {
        let headingIndex = 0;
        function visit(node) {
            if (node.type === 'element' && node.tagName === 'h2') {
                const seed = `${file?.path ?? ''}:${headingIndex++}:${textContent(node)}`;
                node.properties ??= {};
                const existing = node.properties.className ?? [];
                node.properties.className = [...(Array.isArray(existing) ? existing : existing.split(' ')), 'decorated-heading'];
                node.children.push(decoration(seed, 'top'), decoration(seed, 'bottom'));
                return;
            }
            node.children?.forEach(visit);
        }
        visit(tree);
    };
}
