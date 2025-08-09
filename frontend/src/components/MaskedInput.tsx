// Exemplo: components/MaskedInput.tsx
import ReactInputMask from 'react-input-mask';

export default function MaskedInput() {
  return (
    <ReactInputMask
      mask="999.999.999-99"
      className="input"
      placeholder="Digite o CPF"
    />
  );
}
