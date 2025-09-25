import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'category',
      label: 'Overview',
      collapsed: false,
      items: [
        'overview',
        'quickstart',
        'api/reference',
        'security-and-controls',
      ],
    },
    // Billing Models are mentioned on the website, but we only include
    // per-call MCP examples documented in the SDKs you provided.
    {
      type: 'category',
      label: 'Billing Models',
      collapsed: false,
      items: [
        'billing/per-call',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: [
        'integrations/mcp',
      ],
    },
    {
      type: 'category',
      label: 'SDKs',
      collapsed: false,
      items: [
        'sdks/python',
        'sdks/typescript',
      ],
    },
  ],
};

export default sidebars;
