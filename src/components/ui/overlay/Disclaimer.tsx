"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { useDisclosure, useInterval, useLocalStorage } from "@mantine/hooks";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  ScrollShadow,
} from "@heroui/react";
import { DISCLAIMER_STORAGE_KEY, IS_BROWSER } from "@/utils/constants";
import { cn } from "@/utils/helpers";

const COUNTDOWN_DURATION = 10;
const MODAL_SIZE = "3xl";
const DISCLAIMER_CONTENT = {
  title: "Sorumluluk reddi beyanı",
  paragraphs: [
    {
      id: "welcome",
      content:
        "Bir film izleme sitesi olan Yabancıdizi'ye hoş geldiniz. Lütfen bu web sitesini kullanmadan önce bu sorumluluk reddi beyanını dikkatlice okuyun..",
    },
    {
      id: "content-source",
      content:
        "Yabancıdizi'de görüntülenen tüm içerik (filmler, resimler, posterler ve ilgili bilgiler dahil ancak bunlarla sınırlı olmamak üzere) şu kaynaktan alınmıştır:",
      emphasis: "üçüncü taraf sağlayıcılar API'ler veya yerleştirme yoluyla.",
      continuation:
        "Sunucularımızda hiçbir medya dosyası barındırmıyor, depolamıyor veya dağıtmıyoruz. Web sitesi yalnızca internette halihazırda mevcut olan içerikleri bir araya getiriyor.",
    },
    {
      id: "responsibility",
      content:
        "Yabancıdizi'yı kullanarak, kullanıcı eylemleri, içerik doğruluğu veya bu web sitesinin kullanımından kaynaklanan doğrudan veya dolaylı zararlardan sorumlu olmadığımızı kabul etmiş olursunuz. Kullanıcılar, bu hizmeti kullanırken kendi eylemlerinden tamamen sorumludur. Telif haklarına saygı duyuyoruz ve telif hakkı sahiplerinin içerik kaldırma konusundaki yasal taleplerine yanıt vereceğiz..",
    },
    {
      id: "usage",
      content:
        "Bu web sitesi aracılığı ile izinsiz indirme, içeriğin yeniden dağıtımı veya ticari kullanım dahil olmak üzere her türlü yasa dışı faaliyet kesinlikle yasaktır. Yabancıdizi'yi kullanarak, bu şartları kabul etmiş olursunuz!",
      emphasis: "Site içeriğine devam ederek riskleri kabul etmiş olursunuz!",
    },
  ],
};

interface DisclaimerParagraphProps {
  content: string;
  emphasis?: string;
  continuation?: string;
}

const DisclaimerParagraph: React.FC<DisclaimerParagraphProps> = memo(
  ({ content, emphasis, continuation }) => (
    <p>
      {content}
      {emphasis && (
        <>
          {" "}
          <strong>{emphasis}</strong>
        </>
      )}
      {continuation && ` ${continuation}`}
    </p>
  ),
);

DisclaimerParagraph.displayName = "DisclaimerParagraph";

const Disclaimer: React.FC = () => {
  const [hasAgreed, setHasAgreed] = useLocalStorage<boolean>({
    key: DISCLAIMER_STORAGE_KEY,
    defaultValue: false,
    getInitialValueInEffect: false,
  });

  const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_DURATION);

  const shouldShowModal = useMemo(() => !hasAgreed && IS_BROWSER, [hasAgreed]);

  const [isOpen, { close }] = useDisclosure(shouldShowModal);

  useInterval(() => setSecondsRemaining((prev) => Math.max(0, prev - 1)), 1000, {
    autoInvoke: shouldShowModal && secondsRemaining > 0,
  });

  const isButtonDisabled = secondsRemaining > 0;
  const buttonText = useMemo(
    () => `Kabul Et${isButtonDisabled ? ` (${secondsRemaining})` : ""}`,
    [isButtonDisabled, secondsRemaining],
  );

  const handleAgree = useCallback(() => {
    close();
    setHasAgreed(true);
  }, [close, setHasAgreed]);

  if (hasAgreed || !IS_BROWSER) {
    return null;
  }

  return (
    <Modal
      hideCloseButton
      isOpen={isOpen}
      placement="center"
      backdrop="blur"
      size={MODAL_SIZE}
      isDismissable={false}
      scrollBehavior="inside"
      className="bg-background"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-center text-3xl uppercase">
          {DISCLAIMER_CONTENT.title}
        </ModalHeader>

        <ModalBody>
          <ScrollShadow hideScrollBar className="space-y-4">
            {DISCLAIMER_CONTENT.paragraphs.map((paragraph) => (
              <DisclaimerParagraph
                key={paragraph.id}
                content={paragraph.content}
                emphasis={paragraph.emphasis}
                continuation={paragraph.continuation}
              />
            ))}
          </ScrollShadow>
        </ModalBody>

        <ModalFooter className="justify-center">
          <Button
            className={cn(isButtonDisabled && "pointer-events-auto cursor-not-allowed")}
            isDisabled={isButtonDisabled}
            color={isButtonDisabled ? "danger" : "primary"}
            variant="shadow"
            onPress={handleAgree}
          >
            {buttonText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Disclaimer;
