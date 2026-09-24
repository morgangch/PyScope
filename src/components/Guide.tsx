import { useRef, useEffect } from 'react';
import { X, BookOpen, ArrowRight } from 'lucide-react';
export function Guide({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="guide-dialog"
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <button className="icon-button dialog-close" onClick={onClose} aria-label="Fermer le guide">
        <X size={20} />
      </button>
      <span className="guide-symbol">
        <BookOpen size={27} />
      </span>
      <div className="eyebrow">BIENVENUE DANS L’ATELIER</div>
      <h2>
        Un programme.
        <br />
        Tous ses petits pas.
      </h2>
      <p>PyScope vous permet de voir ce qui se passe pendant l’exécution de Python.</p>
      <ol>
        <li>
          <strong>Lisez la ligne éclairée.</strong> Pour un événement « ligne », elle n’a pas encore
          été exécutée. ↗ marque l’appel, ↩ marque la reprise.
        </li>
        <li>
          <strong>Observez la pile.</strong> Chaque fonction a sa carte. Le dernier appel est en
          haut ; les autres attendent.
        </li>
        <li>
          <strong>Suivez les références.</strong> Un lien comme ↗ #o1 désigne un objet. Plusieurs
          noms peuvent pointer vers ce même objet.
        </li>
        <li>
          <strong>Avancez, puis revenez.</strong> Les valeurs barrées sont les anciennes valeurs.
          Chaque étape est un instantané indépendant.
        </li>
      </ol>
      <p className="guide-note">
        Les questions sont facultatives : utilisez « Passer la question » ou désactivez les coups de
        pouce. Le curseur permet de rejoindre librement une étape.
      </p>
      <button className="primary-button" onClick={onClose}>
        C’est parti <ArrowRight size={17} />
      </button>
    </dialog>
  );
}
