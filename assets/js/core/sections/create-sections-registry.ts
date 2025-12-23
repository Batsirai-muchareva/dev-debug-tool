const createSectionsRegistry = () => {
    const sections = new Map();

    const registerSection = ( { id, section }: any ) => {
        sections.set( id, section );
    }

    const getSections = () => {
      return sections
    }

    return {
        registerSection,
        getSections,
    }
}


export const { registerSection, getSections } = createSectionsRegistry()
