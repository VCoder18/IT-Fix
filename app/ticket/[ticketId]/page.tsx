import TicketDetails from '../../../src/app/pages/TicketDetails';

type TicketPageProps = {
  params: {
    ticketId: string;
  };
};

export default function TicketDetailsPage({ params }: TicketPageProps) {
  return <TicketDetails ticketId={params.ticketId} />;
}
