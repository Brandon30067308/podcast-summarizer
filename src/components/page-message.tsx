type Props = {
  message: string | React.ReactNode;
};

export default function PageMessage({ message }: Props) {
  return (
    <div className="flex items-center justify-center px-4 py-8">
      <p className="text-center text-base font-medium">{message}</p>
    </div>
  );
}
