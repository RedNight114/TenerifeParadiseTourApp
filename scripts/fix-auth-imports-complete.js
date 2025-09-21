const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/auth/login/page.tsx',
  'app/auth/register/page.tsx',
  'app/auth/forgot-password/page.tsx',
  'app/auth/reset-password/page.tsx',
  'app/admin/login/page.tsx',
  'app/admin/dashboard-direct/page.tsx',
  'components/admin/admin-guard.tsx',
  'components/admin/admin-guard-fixed.tsx',
  'components/admin/admin-guard-enhanced.tsx',
  'hooks/use-authorization.ts'
];

const rootDir = path.resolve(__dirname, '..');

console.log('🔧 Fixing auth imports and properties...\n');

let totalFixed = 0;

filesToFix.forEach(fileRelativePath => {
  const filePath = path.join(rootDir, fileRelativePath);
  
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace useAuthContext import
    if (content.includes('import { useAuthContext } from "@/components/auth-provider"')) {
      content = content.replace(
        /import { useAuthContext } from "@\/components\/auth-provider"/g,
        'import { useAuth } from "@/hooks/use-auth"'
      );
      modified = true;
    }

    // Replace useAuthContext usage
    if (content.includes('useAuthContext()')) {
      content = content.replace(/useAuthContext\(\)/g, 'useAuth()');
      modified = true;
    }

    // Fix loading property
    if (content.includes('loading: authLoading')) {
      content = content.replace(/loading:\s*authLoading/g, 'isLoading: authLoading');
      modified = true;
    }

    if (content.includes('const { user, loading,') && !content.includes('isLoading:')) {
      content = content.replace(
        /const\s*{\s*user,\s*loading,/g,
        'const { user, isLoading: loading,'
      );
      modified = true;
    }

    // Fix signIn to login
    if (content.includes('signIn,') && !content.includes('login:')) {
      content = content.replace(/signIn,/g, 'login: signIn,');
      modified = true;
    }

    // Fix isAuthenticated property
    if (content.includes('isAuthenticated }')) {
      content = content.replace(
        /const\s*{\s*([^}]*),\s*isAuthenticated\s*}/g,
        (match, p1) => {
          return `const { ${p1} }\n  const isAuthenticated = !!user`;
        }
      );
      modified = true;
    }

    // Fix signOut to logout
    if (content.includes('signOut()')) {
      content = content.replace(/signOut\(\)/g, 'logout()');
      modified = true;
    }

    // Add logout to destructuring if signOut was present
    if (content.includes('await signOut()') && !content.includes('logout')) {
      // Find the useAuth destructuring and add logout
      content = content.replace(
        /const\s*{\s*([^}]*)\s*}\s*=\s*useAuth\(\)/g,
        (match, p1) => {
          const parts = p1.split(',').map(s => s.trim()).filter(Boolean);
          if (!parts.includes('logout')) {
            parts.push('logout');
          }
          return `const { ${parts.join(', ')} } = useAuth()`;
        }
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${fileRelativePath}`);
      totalFixed++;
    } else {
      console.log(`➡️  No changes needed: ${fileRelativePath}`);
    }

  } catch (error) {
    console.error(`❌ Error fixing ${fileRelativePath}:`, error.message);
  }
});

console.log(`\n✅ Fixed ${totalFixed} files`);
console.log('🎉 Auth import fixes completed!');
