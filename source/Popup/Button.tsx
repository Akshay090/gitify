import React from 'react';
import './Button.scss';

type TrueFalseNull = true | false | null;

interface Props {
  children?: React.ReactNode;
  BtnTheme: string;
  BtnText: string;
  BtnClickFxn: React.MouseEventHandler;
  Vsep?: TrueFalseNull;
}

const Button: React.FC<Props> = (props: Props) => {
  const {BtnClickFxn, BtnText, BtnTheme, children, Vsep} = props;
  return (
    <div className={`${BtnTheme} btn`}>
      <button type="button" className="btn-reset" onClick={BtnClickFxn}>
        {BtnText}
      </button>
      {Vsep != null ? <div className="div vertical-sep" /> : null}
      {children}
    </div>
  );
};

export default Button;
