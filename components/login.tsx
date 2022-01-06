interface Props {
  onClickGoogleSignIn: () => void;
  /** 노출 여부 결정 */
  show: boolean;
  onClickClose: () => void;
}

const Login: React.FC<Props> = ({ onClickGoogleSignIn, show, onClickClose }) => (
  <section className={`absolute w-full h-full top-0 ${!show && 'hidden'} bg-white`}>
    <button
      className="modal-close absolute top-0 left-0 cursor-pointer flex flex-col items-center mt-4 ml-4 text-sm z-50"
      type="button"
      onClick={onClickClose}
    >
      <svg
        className="fill-current text-black"
        xmlns="http://www.w3.org/2000/svg"
        width="36"
        height="36"
        viewBox="0 0 18 18"
      >
        <path d="M14.53 4.53l-1.06-1.06L9 7.94 4.53 3.47 3.47 4.53 7.94 9l-4.47 4.47 1.06 1.06L9 10.06l4.47 4.47 1.06-1.06L10.06 9z" />
      </svg>
      <div>(esc)</div>
    </button>
    <div className="container mx-auto px-4 h-full">
      <div className="flex content-center items-center justify-center h-full">
        <div className="w-full lg:w-4/12 px-4">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-gray-300 border-0">
            <div className="rounded-t mb-0 px-6 py-6">
              <div className="text-center mb-3">
                <h6 className="text-gray-600 text-sm font-bold">Sign in with</h6>
              </div>
              <div className="btn-wrapper text-center">
                <button
                  className="bg-white active:bg-gray-100 text-gray-800 font-normal px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 uppercase shadow hover:shadow-md inline-flex items-center font-bold text-xs"
                  type="button"
                  style={{ transition: 'all .15s ease' }}
                  onClick={onClickGoogleSignIn}
                >
                  <img alt="..." className="w-5 mr-1" src="images/google.svg" />
                  Google
                </button>
              </div>
              {/* <hr className="mt-6 border-b-1 border-gray-400" /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Login;
