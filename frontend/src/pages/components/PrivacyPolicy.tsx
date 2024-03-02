import React from 'react';
import {
  Button,
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Flex,
} from '@chakra-ui/react';

const PrivacyPolicy = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  /*
  circle back and use the text overrides to format policy copy properly.
  [https://chakra-ui.com/docs/components/text]
  also modularize the policy copy into a separate file
  */

  return (
    <>
      <Button onClick={onOpen} colorScheme="black" variant="link" m="8px">
        Privacy Policy
      </Button>

      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Privacy Policy</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              {' '}
              Privacy Policy for MusicPractice App Last Updated: [Date] Thank
              you for using the MusicPractice app. This Privacy Policy outlines
              how we collect, use, and protect your information when you use our
              application. Information We Collect Google Authentication To
              provide a seamless and secure user experience, the MusicPractice
              app uses Google authentication. When you log in, the app collects
              the following information from your Google account: Name: We
              collect your name to personalize your experience within the app.
              Email: We access your email address to facilitate communication
              and account management. How We Use Your Information The
              information collected is used for the following purposes:
              Personalization: Your name is used to personalize your experience
              within the app. Communication: We may use your email address to
              communicate important updates, notifications, and account-related
              information. Authentication: Google authentication is solely used
              for verifying your identity and ensuring the security of your
              account. Data Security We prioritize the security of your
              information and employ industry-standard measures to protect it
              from unauthorized access, disclosure, alteration, and destruction.
              Third-Party Services The MusicPractice app utilizes Google
              authentication for user login. Please review Google's privacy
              policy for information on how they handle your data. Data
              Retention We retain your information for as long as it is
              necessary for the purposes outlined in this privacy policy or as
              required by law. If you choose to delete your account, your
              information will be securely deleted from our systems. Your
              Choices You have the right to: Access: Request access to the
              personal information we hold about you. Correction: Request
              correction of any inaccurate or incomplete information. Deletion:
              Request the deletion of your account and associated information.
              Changes to Privacy Policy This Privacy Policy may be updated to
              reflect changes in our practices or for legal reasons. We
              encourage you to review this policy periodically. Contact Us If
              you have any questions, concerns, or requests regarding your
              privacy or this policy, please contact us at [contact@email.com].
              By using the MusicPractice app, you agree to the terms outlined in
              this Privacy Policy. Thank you for trusting us with your
              information.{' '}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PrivacyPolicy;
