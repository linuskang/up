# Upstream Playground SDK Example

To try out the example:

```bash
npm install # Install @upstreamlabs/sdk

cp .env.example .env # Add your Upstream API Key

# Run the example script
npm run log
```

It will return the following response:

```json
{
    success: true,
        result: {
        id: string,
        title: string,
        icon: string,
        content: string,
        category: string,
        fields: Field[],
        events: TimelineEvent[],
        data: JSON,
        actions: Action[],
        createdAt: string,
        projectId: string
    }
}
```