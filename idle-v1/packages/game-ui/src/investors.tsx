export interface InvestorEventDialogProps {
  amount: string;
  dialogue: string;
  labName: string;
  name: string;
  onRespond: (response: "yes" | "no") => void;
  portraitSrc?: string;
  role: string;
}

export function InvestorEventDialog({
  amount,
  dialogue,
  labName,
  name,
  onRespond,
  portraitSrc,
  role,
}: InvestorEventDialogProps) {
  return (
    <div className="idle-investor-event" role="presentation">
      <section
        className="idle-investor-event__dialog"
        role="dialog"
        aria-labelledby="idle-investor-event-title"
        aria-modal="true"
      >
        {portraitSrc ? (
          <div className="idle-investor-event__portrait" aria-hidden="true">
            <img src={portraitSrc} alt="" width="128" height="128" />
          </div>
        ) : null}
        <div className="idle-investor-event__body">
          <span className="idle-investor-event__eyebrow">Unexpected visitor</span>
          <h1 id="idle-investor-event-title">{name} heard about {labName}.</h1>
          <small>{role}</small>
          <blockquote>“{dialogue}”</blockquote>
          <p className="idle-investor-event__offer">
            He offers to wire <strong>{amount}</strong> to {labName}.
          </p>
          <p>Take the money?</p>
          <div className="idle-investor-event__actions">
            <button type="button" onClick={() => onRespond("yes")}>Yes</button>
            <button type="button" onClick={() => onRespond("no")}>No</button>
          </div>
        </div>
        <footer>Any resemblance to real people or organizations is totally coincidental.</footer>
      </section>
    </div>
  );
}
