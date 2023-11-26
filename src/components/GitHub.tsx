
export const GitHub: React.FC = () => {
    return (
    <div onClick={() => {
      window.open("https://github.com/Zerobeings/skinnerbox3", "_blank");
      }}
      className="spacing-1 absolute bottom-4 right-20 flex cursor-pointer items-center"
    >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path
            fill="#AEAEB2"
            d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.43 9.8 8.2 11.4.6.1.8-.3.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1 1.6 1 1.6 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.7-1.4-2.5-.3-5-1.3-5-5.8 0-1.3.5-2.4 1.1-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2.9-.3 1.9-.4 2.9-.4s2 .1 2.9.4c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.6.8 1.1 1.9 1.1 3.2 0 4.5-2.5 5.5-5 5.8.4.4.8 1.1.8 2.3v3.4c0 .3.2.7.8.6C20.6 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"
          />
        </svg>
    </div>
  );
};