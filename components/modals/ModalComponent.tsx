import { useState } from "react";
import Modal from "react-modal";
import { AnimatePresence, motion } from "framer-motion";

const ModalComponent = ({
  Content,
  modalOpen,
  setModalOpen,
  nft,
  fetchUserNFTs,
}: {
  Content: any;
  modalOpen: boolean;
  setModalOpen: any;
  nft?: any;
  fetchUserNFTs?: any;
}) => {
  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div
      id='modal'
      className='fixed top-0 right-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50'
    >
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        className='modal w-auto bg-transparent'
        overlayClassName='overlay '
        ariaHideApp={false}
      >
        <AnimatePresence>
          <Content fetchUserNFTs={fetchUserNFTs} nft={nft} close={closeModal} />
        </AnimatePresence>
      </Modal>
    </div>
  );
};

export default ModalComponent;
