import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = ({ children, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    {children}
  </svg>
);

export const AIIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M14.25 6C14.25 5.30964 13.6904 4.75 13 4.75C12.3096 4.75 11.75 5.30964 11.75 6V11.25H10V6C10 5.30964 9.44036 4.75 8.75 4.75C8.05964 4.75 7.5 5.30964 7.5 6V11.25H5.75V6C5.75 5.30964 5.19036 4.75 4.5 4.75C3.80964 4.75 3.25 5.30964 3.25 6V12C3.25 15.0118 5.11101 17.5831 7.93549 18.5133L7.3323 19.8322C6.93665 20.7224 7.59604 21.75 8.55266 21.75H14.4473C15.404 21.75 16.0633 20.7224 15.6677 19.8322L15.0645 18.5133C17.889 17.5831 19.75 15.0118 19.75 12V6C19.75 5.30964 19.1904 4.75 18.5 4.75C17.8096 4.75 17.25 5.30964 17.25 6V11.25H15.5V6C15.5 5.30964 14.9404 4.75 14.25 4.75Z"/>
    </svg>
);

export const SettingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-1.04 1.136-1.136l1.716-.286a1.125 1.125 0 011.136 1.136l.286 1.716c.09.542.56 1.04 1.136 1.136l1.716.286a1.125 1.125 0 010 2.272l-1.716.286c-.576.097-1.046.596-1.136 1.136l-.286 1.716a1.125 1.125 0 01-2.272 0l-.286-1.716c-.09-.542-.56-1.04-1.136-1.136l-1.716-.286a1.125 1.125 0 010-2.272l1.716-.286z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 15.625l.286 1.716a1.125 1.125 0 01-2.272 0l.286-1.716c.09-.542.56-1.04 1.136-1.136l1.716-.286a1.125 1.125 0 011.136 1.136l-.286 1.716" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
  </Icon>
);

export const GlobeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 01-9-9 9 9 0 019-9m9 9a9 9 0 01-9 9M3.75 12h16.5m-16.5 0a9 9 0 019-9 9 9 0 019 9m-9 9a9 9 0 01-9-9" />
  </Icon>
);

export const MicIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5a6 6 0 00-12 0v1.5a6 6 0 006 6z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12.75a7.5 7.5 0 01-7.5 7.5 7.5 7.5 0 01-7.5-7.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75v6.75m0 0H9m3 0h3" />
  </Icon>
);

export const StopIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
  </Icon>
);

export const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </Icon>
);

export const LoaderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" {...props} className={`animate-spin ${props.className}`}>
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5 .124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876V5.25a2.25 2.25 0 00-2.25-2.25h-7.5a2.25 2.25 0 00-2.25 2.25v13.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25z" />
  </Icon>
);

export const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </Icon>
);

export const LanguageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m10.5 21 5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 0 1 6-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C13.18 7.061 14.122 8 15 8s1.82-.939 2.666-2.636m-1.114 0a48.47 0 0 0-6.338 0" />
    </Icon>
);

export const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </Icon>
);

export const SwitchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </Icon>
);

export const SpellCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </Icon>
);

export const SoundIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
    </Icon>
);

export const DocumentScanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.5a.75.75 0 0 0-.75.75v13.5a.75.75 0 0 0 .75.75h16.5a.75.75 0 0 0 .75-.75V5.25a.75.75 0 0 0-.75-.75H3.75Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15h7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12h7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9h4.5" />
    </Icon>
);

// Icon for AI Agent Card
export const CpuChipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5m0 15v-1.5M12 8.25v-5.25M12 21v-5.25" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6v6H9z" />
    </Icon>
);


// Icons for AI Agent Page
export const PencilSquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </Icon>
);

export const CodeBracketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5 0-4.5 16.5" />
    </Icon>
);

export const PaperAirplaneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
    </Icon>
);

export const ClipboardDocumentListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.75V16.5a2.25 2.25 0 0 1-2.25 2.25H6.75a2.25 2.25 0 0 1-2.25-2.25V3.75m9 0-3.75-3-3.75 3m9 0H6.75M9 12h6M9 15h3.75" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21H3.75A2.25 2.25 0 0 1 1.5 18.75V7.5A2.25 2.25 0 0 1 3.75 5.25h16.5A2.25 2.25 0 0 1 22.5 7.5v11.25a2.25 2.25 0 0 1-2.25 2.25h-3.75" />
    </Icon>
);

export const AcademicCapIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path d="M3.75 12.188A2.25 2.25 0 0 1 6 9.938h12a2.25 2.25 0 0 1 2.25 2.25v2.25a2.25 2.25 0 0 1-2.25 2.25h-1.5a.75.75 0 0 0-.75.75v.75a.75.75 0 0 0 .75.75h3a.75.75 0 0 0 .75-.75v-6a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 1-.75-.75V9.938a3.75 3.75 0 0 0-3.75-3.75H6a3.75 3.75 0 0 0-3.75 3.75v2.25Z" />
        <path d="m4.125 12.188 1.875.938a.75.75 0 0 0 .75 0l1.875-.938M18 18.375l-3-1.5a.75.75 0 0 0-.75 0l-3 1.5m6-3.75-3-1.5m0 0-3 1.5" />
    </Icon>
);

export const BookOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6-2.292m0 0V3.75m0 16.5" />
    </Icon>
);

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m9.813 5.146 9.027 3.99c4.05 1.79 4.05 4.718 0 6.508l-9.027 3.99c-6.074 2.68-11.54-2.79-9.027-9.027l2.12-7.468a.624.624 0 0 1 .624-.624l7.468-2.12c6.237-2.513 11.7 2.954 9.027 9.027Z" />
    </Icon>
);

export const ChatBubbleLeftRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193l-3.722.25c-.347.023-.682-.123-.884-.386a1.5 1.5 0 0 1-.44-1.298v-3.21c0-.825.5-1.56 1.25-1.848l3.752-1.431ZM14.25 18.169V6.432c0-1.136.847-2.1 1.98-2.193l3.722-.25c.347-.023.682.123.884.386a1.5 1.5 0 0 1 .44 1.298v3.21c0 .825-.5 1.56-1.25 1.848l-3.752 1.431A1.5 1.5 0 0 1 14.25 18.169Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.125 8.169V5.432c0-1.136.847-2.1 1.98-2.193l3.722-.25c.347-.023.682.123.884.386a1.5 1.5 0 0 1 .44 1.298v3.21c0 .825-.5 1.56-1.25 1.848l-3.752 1.431A1.5 1.5 0 0 1 4.125 8.169Z" />
    </Icon>
);