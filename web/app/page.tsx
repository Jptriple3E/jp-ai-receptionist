import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <main>
      <nav className="nav">
        <strong>JP Digital AI</strong>
        <a href="#contact">Start a project</a>
      </nav>

      <section className="hero">
        <p className="eyebrow">WEBSITE DESIGN & DEVELOPMENT</p>

        <h1>
          Modern websites built to make your business look{" "}
          <span>exceptional.</span>
        </h1>

        <p className="sub">
          I&apos;m Eboh Emmanuel Emeke, a website designer and developer in
          Delta State, Nigeria. I build modern SaaS-style business websites
          for companies that want a stronger online presence.
        </p>

        <div className="actions">
          <a className="primary" href="#contact">
            Start a project
          </a>

          <a
            className="secondary"
            href="https://saas-web-portfolio-1r1h.vercel.app/#contact"
          >
            View portfolio
          </a>
        </div>
      </section>

      <section className="features">
        <article>
          <b>01</b>
          <h2>Modern SaaS design</h2>
          <p>
            Clean, responsive interfaces designed around trust and conversion.
          </p>
        </article>

        <article>
          <b>02</b>
          <h2>Business-focused</h2>
          <p>
            Clear messaging, calls to action and contact flows that help
            visitors take the next step.
          </p>
        </article>

        <article>
          <b>03</b>
          <h2>AI-ready</h2>
          <p>
            Your website can answer questions, talk to visitors and capture
            leads even when you are away.
          </p>
        </article>
      </section>

      <section id="contact" className="contact">
        <p className="eyebrow">LET&apos;S BUILD</p>

        <h2>Have a project in mind?</h2>

        <p>
          Ask the AI assistant anything, or contact me directly at
          jpdigitalai@gmail.com.
        </p>
      </section>

      <footer>
        © {new Date().getFullYear()} Eboh Emmanuel Emeke · JP Digital AI
      </footer>

      <ChatWidget />
    </main>
  );
        }
