import { forwardRef } from "react";

const Modal = forwardRef((props, ref) => {
  return (
    <>
      <dialog ref={ref} id="my_modal_2" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">Warning</h3>
          <p className="py-4">Please allow permission to use camera and microphone and reload</p>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
});
export default Modal;
