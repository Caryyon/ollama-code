import simpleGit from 'simple-git';

/**
 * Tool for performing Git operations
 * @param {Object} args - Tool arguments
 * @param {string} args.operation - Git operation to perform
 * @param {Object} [args.params] - Parameters for the operation
 * @returns {Promise<any>} - Operation result
 */
export async function gitTool(args) {
    if (!args.operation) {
        throw new Error('Operation is required');
    }

    const params = args.params || {};

    try {
        // Initialize git
        const git = simpleGit(process.cwd());

        // Check if git is installed
        const isRepo = await git.checkIsRepo();
        if (!isRepo) {
            throw new Error('Not a git repository');
        }

        // Perform the requested operation
        switch (args.operation.toLowerCase()) {
            case 'status':
                return await git.status();

            case 'log':
                return await git.log({
                    maxCount: params.maxCount || 10,
                    ...params
                });

            case 'add':
                if (!params.files && !params.all) {
                    throw new Error('Files parameter is required for add operation');
                }

                if (params.all) {
                    await git.add('.');
                } else {
                    const files = Array.isArray(params.files) ? params.files : [params.files];
                    await git.add(files);
                }

                return await git.status();

            case 'commit':
                if (!params.message) {
                    throw new Error('Commit message is required');
                }

                return await git.commit(params.message);

            case 'push':
                return await git.push(params.remote || 'origin', params.branch || 'main', params.options || []);

            case 'pull':
                return await git.pull(params.remote || 'origin', params.branch || 'main', params.options || {});

            case 'branch':
                if (params.create) {
                    await git.checkoutLocalBranch(params.create);
                    return `Created and switched to branch ${params.create}`;
                }

                if (params.checkout) {
                    await git.checkout(params.checkout);
                    return `Switched to branch ${params.checkout}`;
                }

                return await git.branchLocal();

            case 'diff':
                if (params.files) {
                    const files = Array.isArray(params.files) ? params.files : [params.files];
                    return await git.diff([params.from || 'HEAD', params.to || '', '--', ...files]);
                }

                return await git.diff([params.from || 'HEAD', params.to || '']);

            case 'blame':
                if (!params.file) {
                    throw new Error('File parameter is required for blame operation');
                }

                return await git.raw(['blame', params.file]);

            default:
                throw new Error(`Unsupported git operation: ${args.operation}`);
        }
    } catch (error) {
        throw new Error(`Git operation failed: ${error.message}`);
    }
}