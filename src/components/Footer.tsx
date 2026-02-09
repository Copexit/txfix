export function Footer() {
  return (
    <footer className="flex items-center justify-center px-4 py-4 text-xs text-muted border-t border-card-border">
      <span>
        Free &amp; open source &middot;{" "}
        <a
          href="https://github.com/shacollision/txfix"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          GitHub
        </a>
      </span>
    </footer>
  );
}
