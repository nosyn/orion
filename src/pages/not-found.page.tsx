import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/ui/empty';

export function NotFoundPage() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>404 - Not Found</EmptyTitle>
        <EmptyDescription>
          The page you&apos;re looking for doesn&apos;t exist.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <EmptyDescription>
          Please send feedback if you think this is a mistake or report bugs on
          our{' '}
          <a
            href='https://github.com/nosyn/orion/issues'
            target='_blank'
            rel='noreferrer'
          >
            GitHub Issues page
          </a>
        </EmptyDescription>
      </EmptyContent>
    </Empty>
  );
}
