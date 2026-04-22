import { CheckCircle, AlertOctagon } from "lucide-react";

export default function Modal({
  isOpen,
  type,
  title,
  message,
  titleButton,
  action,
}) {
  if (!isOpen) return null;

  const iconMap = {
    success: <CheckCircle />,
    error: <AlertOctagon />,
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-icon">{iconMap[type]}</div>
        <h2 className="modal-title">{title}</h2>
        <p className="modal-message">{message}</p>
        <button className="modal-button" onClick={action}>
          {titleButton}
        </button>
      </div>
    </div>
  );
}
