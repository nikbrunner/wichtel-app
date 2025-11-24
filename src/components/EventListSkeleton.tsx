import { Paper, Stack, Group, Skeleton } from "@mantine/core";

export function EventListSkeleton() {
  return (
    <Stack gap="md">
      {[1, 2, 3].map(i => (
        <Paper key={i} p="lg" withBorder shadow="sm">
          <Stack gap="sm">
            {/* Header */}
            <Group justify="space-between" wrap="nowrap">
              <div style={{ flex: 1 }}>
                <Group gap="sm" mb={4}>
                  <Skeleton height={28} width={200} />
                  <Skeleton height={24} width={80} />
                </Group>
                <Skeleton height={16} width={300} />
              </div>
            </Group>

            {/* Stats */}
            <Group gap="lg">
              <div>
                <Skeleton height={12} width={80} mb={4} />
                <Skeleton height={20} width={30} />
              </div>
              <div>
                <Skeleton height={12} width={80} mb={4} />
                <Skeleton height={20} width={50} />
              </div>
            </Group>

            {/* Button */}
            <Skeleton height={36} width={200} mt="sm" />
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
}
