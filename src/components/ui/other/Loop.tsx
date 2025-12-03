import { useId } from "@mantine/hooks";
import { Fragment, PropsWithChildren } from "react";

export interface LoopProps extends PropsWithChildren {
  count: number;
  prefix?: string;
}

/**
 * Belirtilen alt bileşen `count`'u tekrar tekrar döndürür.
 * Gerçek veriler mevcut olmadan önce verileri taklit etmek için kullanışlıdır.
 *
 * @param count Alt bileşenlerin kaç kez tekrarlanacağı.
 * @param prefix React anahtarı için kullanılacak önek.
 * @param children Döngüye alınacak alt bileşen.
 */
const Loop: React.FC<LoopProps> = ({ count, prefix, children }) => {
  const id = useId();
  const key = prefix || id;

  return Array.from({ length: count }).map((_, index) => (
    <Fragment key={`${key}-${index + 1}`}>{children}</Fragment>
  ));
};

export default Loop;
